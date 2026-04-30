import type { FastifyRequest, FastifyReply } from "fastify";
import type { IncomingHttpHeaders } from "http";
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { AppSession } from "../types.js";

function toWebHeaders(headers: IncomingHttpHeaders): Headers {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) webHeaders.append(key, v);
    } else {
      webHeaders.set(key, value);
    }
  }
  return webHeaders;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const raw = await auth.api.getSession({ headers: toWebHeaders(request.headers) });

  if (!raw) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  request.session = raw as AppSession;
}

// Checks that the user has a workspace. Falls back to a DB lookup because the
// session cookie may be cached from before the workspace was created (e.g.
// during the onboarding flow where workspace is created mid-session).
export async function requireWorkspace(request: FastifyRequest, reply: FastifyReply) {
  if (request.session?.user.workspaceId) return;

  const [row] = await db
    .select({ workspaceId: users.workspaceId })
    .from(users)
    .where(eq(users.id, request.session!.user.id));

  if (!row?.workspaceId) {
    return reply.status(403).send({ error: "No workspace" });
  }

  // Patch the in-memory session so downstream handlers can read it
  request.session!.user.workspaceId = row.workspaceId;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.session?.user.role !== "admin") {
    return reply.status(403).send({ error: "Admin access required" });
  }
}

// Fastify type augmentation
declare module "fastify" {
  interface FastifyRequest {
    session?: AppSession;
  }
}
