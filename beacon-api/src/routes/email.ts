import type { FastifyInstance } from "fastify";
import { createHmac } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getGmailAuthUrl, exchangeGmailCode } from "../lib/gmail.js";
import { getOutlookAuthUrl, exchangeOutlookCode } from "../lib/outlook.js";

const FRONTEND_URL = () => process.env.FRONTEND_URL ?? "http://localhost:3000";
const SECRET = () => process.env.BETTER_AUTH_SECRET ?? "dev-secret";

function signState(userId: string, provider: string): string {
  const payload = `${userId}:${provider}:${Math.floor(Date.now() / 1000)}`;
  const sig = createHmac("sha256", SECRET()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

function verifyState(state: string): { userId: string; provider: string } | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString();
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = createHmac("sha256", SECRET()).update(payload).digest("hex");
    if (sig !== expected) return null;
    const [userId, provider, ts] = payload.split(":");
    // Expire after 10 minutes
    if (Date.now() / 1000 - parseInt(ts) > 600) return null;
    return { userId, provider };
  } catch {
    return null;
  }
}

export async function emailRoutes(app: FastifyInstance) {
  // ── Gmail ──────────────────────────────────────────────────────────────────

  app.get("/gmail/connect", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.session!.user.id;
    const state = signState(userId, "gmail");
    return reply.redirect(getGmailAuthUrl(state));
  });

  app.get("/gmail/callback", async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error || !query.code || !query.state) {
      return reply.redirect(`${FRONTEND_URL()}/settings/email?error=gmail_denied`);
    }

    const parsed = verifyState(query.state);
    if (!parsed || parsed.provider !== "gmail") {
      return reply.redirect(`${FRONTEND_URL()}/settings/email?error=gmail_state`);
    }

    try {
      const { accessToken, refreshToken, expiry, email } = await exchangeGmailCode(query.code);
      await db.update(users).set({
        gmailAccessToken: accessToken,
        gmailRefreshToken: refreshToken,
        gmailTokenExpiry: expiry,
        gmailEmail: email,
        updatedAt: new Date(),
      }).where(eq(users.id, parsed.userId));

      return reply.redirect(`${FRONTEND_URL()}/settings/email?connected=gmail`);
    } catch (err) {
      console.error("Gmail OAuth error:", err);
      return reply.redirect(`${FRONTEND_URL()}/settings/email?error=gmail_failed`);
    }
  });

  // ── Outlook ────────────────────────────────────────────────────────────────

  app.get("/outlook/connect", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.session!.user.id;
    const state = signState(userId, "outlook");
    return reply.redirect(getOutlookAuthUrl(state));
  });

  app.get("/outlook/callback", async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error || !query.code || !query.state) {
      return reply.redirect(`${FRONTEND_URL()}/settings/email?error=outlook_denied`);
    }

    const parsed = verifyState(query.state);
    if (!parsed || parsed.provider !== "outlook") {
      return reply.redirect(`${FRONTEND_URL()}/settings/email?error=outlook_state`);
    }

    try {
      const { accessToken, refreshToken, expiry, email } = await exchangeOutlookCode(query.code);
      await db.update(users).set({
        outlookAccessToken: accessToken,
        outlookRefreshToken: refreshToken,
        outlookTokenExpiry: expiry,
        outlookEmail: email,
        updatedAt: new Date(),
      }).where(eq(users.id, parsed.userId));

      return reply.redirect(`${FRONTEND_URL()}/settings/email?connected=outlook`);
    } catch (err) {
      console.error("Outlook OAuth error:", err);
      return reply.redirect(`${FRONTEND_URL()}/settings/email?error=outlook_failed`);
    }
  });
}
