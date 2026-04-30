import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { workspaces, subscriptions, users } from "../db/schema.js";
import { requireAuth, requireWorkspace, requireAdmin } from "../middleware/requireAuth.js";

export async function workspaceRoutes(app: FastifyInstance) {
  app.get("/workspace", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.workspaceId, workspaceId));

    const [user] = await db
      .select({
        gmailEmail: users.gmailEmail,
        gmailAccessToken: users.gmailAccessToken,
        outlookEmail: users.outlookEmail,
        outlookAccessToken: users.outlookAccessToken,
      })
      .from(users)
      .where(eq(users.id, userId));

    return reply.send({
      workspace: {
        ...workspace,
        // Flatten subscription data onto workspace for convenience
        plan: subscription?.plan ?? "solo",
        subscriptionStatus: subscription?.status ?? "trialing",
        trialEndsAt: subscription?.currentPeriodEnd ?? null,
        trialLettersUsed: subscription?.trialLettersUsed ?? 0,
        trialLettersLimit: subscription?.trialLettersLimit ?? 10,
        // Flatten current user's OAuth status
        gmailConnected: !!(user?.gmailAccessToken),
        gmailEmail: user?.gmailEmail ?? null,
        outlookConnected: !!(user?.outlookAccessToken),
        outlookEmail: user?.outlookEmail ?? null,
      },
    });
  });

  app.patch("/workspace", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const updates = request.body as Record<string, unknown>;

    const allowed = [
      "name", "agentName", "state", "phone", "workEmail",
      "agencyVoice", "signoff", "signatureBlock", "eoDisclaimer", "logoUrl",
    ] as const;

    const patch = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k as typeof allowed[number]))
    );

    if (Object.keys(patch).length === 0) {
      return reply.status(400).send({ error: "No valid fields provided" });
    }

    const [updated] = await db.update(workspaces)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return reply.send({ workspace: updated });
  });

  // Disconnect an email provider (clears tokens for the requesting user)
  app.post("/workspace/email/disconnect", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const userId = request.session!.user.id;
    const { provider } = request.body as { provider: "gmail" | "outlook" };

    if (provider === "gmail") {
      await db.update(users)
        .set({
          gmailAccessToken: null,
          gmailRefreshToken: null,
          gmailTokenExpiry: null,
          gmailEmail: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else if (provider === "outlook") {
      await db.update(users)
        .set({
          outlookAccessToken: null,
          outlookRefreshToken: null,
          outlookTokenExpiry: null,
          outlookEmail: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      return reply.status(400).send({ error: "Invalid provider" });
    }

    return reply.send({ ok: true });
  });
}
