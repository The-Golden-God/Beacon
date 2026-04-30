import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { workspaces, subscriptions, users } from "../db/schema.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";
import { generateWorkspaceSlug } from "../lib/utils.js";

export async function authRoutes(app: FastifyInstance) {
  // Called after signup to create workspace + subscription.
  // Idempotent: if workspace already exists, updates the name instead.
  app.post("/workspace/setup", {
    preHandler: requireAuth,
    schema: {
      body: {
        type: "object",
        required: ["agencyName"],
        properties: {
          agencyName: { type: "string", minLength: 1, maxLength: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const { agencyName } = request.body as { agencyName: string };
    const userId = request.session!.user.id;

    // Re-read from DB so we're not relying on a potentially stale session cookie
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    const existingWorkspaceId = currentUser?.workspaceId ?? request.session!.user.workspaceId;

    if (existingWorkspaceId) {
      const [workspace] = await db.update(workspaces)
        .set({ name: agencyName, updatedAt: new Date() })
        .where(eq(workspaces.id, existingWorkspaceId))
        .returning();
      return reply.send({ workspaceId: workspace.id });
    }

    const slug = generateWorkspaceSlug(agencyName);
    const [workspace] = await db.insert(workspaces).values({ name: agencyName, slug }).returning();

    await db.insert(subscriptions).values({
      workspaceId: workspace.id,
      stripeCustomerId: `pending_${workspace.id}`,
      plan: "solo",
      status: "trialing",
    });

    await db.update(users)
      .set({ workspaceId: workspace.id, role: "admin" })
      .where(eq(users.id, userId));

    return reply.status(201).send({ workspaceId: workspace.id });
  });

  app.get("/me", { preHandler: requireAuth }, async (request, reply) => {
    const [user] = await db.select().from(users).where(eq(users.id, request.session!.user.id));
    return reply.send({ user });
  });

  app.patch("/me", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.session!.user.id;
    const body = request.body as { onboardingComplete?: boolean; name?: string };

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.onboardingComplete === "boolean") patch.onboardingComplete = body.onboardingComplete;
    if (body.name?.trim()) patch.name = body.name.trim();

    const [updated] = await db.update(users).set(patch).where(eq(users.id, userId)).returning();
    return reply.send({ user: updated });
  });
}
