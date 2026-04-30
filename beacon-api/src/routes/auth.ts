import type { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "../db/index.js";
import { workspaces, subscriptions, users, clients, letters, templates, eoLog } from "../db/schema.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";
import { generateWorkspaceSlug } from "../lib/utils.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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

  // ── Data export ──────────────────────────────────────────────────────────────
  // Returns a JSON file containing all workspace data for portability.
  app.get("/account/export", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt }).from(users).where(eq(users.id, userId));
    const clientRows = await db.select().from(clients).where(eq(clients.workspaceId, workspaceId));
    const letterRows = await db.select().from(letters).where(eq(letters.workspaceId, workspaceId));
    const templateRows = await db.select().from(templates).where(eq(templates.workspaceId, workspaceId));
    const logRows = await db.select().from(eoLog).where(eq(eoLog.workspaceId, workspaceId));

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: user,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        agentName: workspace.agentName,
        state: workspace.state,
        phone: workspace.phone,
        workEmail: workspace.workEmail,
        createdAt: workspace.createdAt,
      },
      clients: clientRows,
      letters: letterRows,
      templates: templateRows,
      eoLog: logRows,
    };

    const filename = `beacon-export-${new Date().toISOString().slice(0, 10)}.json`;
    reply.raw.setHeader("Content-Type", "application/json");
    reply.raw.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    reply.raw.end(JSON.stringify(exportData, null, 2));
  });

  // ── Account deletion ──────────────────────────────────────────────────────────
  // Requires body { confirmation: "DELETE" }. Admin-only for workspace accounts.
  // Cancels Stripe subscription, anonymizes E&O log, then cascade-deletes workspace + user.
  app.delete("/account", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const { confirmation } = request.body as { confirmation?: string };
    if (confirmation !== "DELETE") {
      return reply.status(400).send({ error: "Type DELETE to confirm account deletion" });
    }

    const userId = request.session!.user.id;
    const workspaceId = request.session!.user.workspaceId!;

    // Only admins can delete the workspace
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    if (user?.role !== "admin") {
      return reply.status(403).send({ error: "Only workspace admins can delete the account" });
    }

    // Cancel Stripe subscription if active
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId));
    if (stripe && sub?.stripeSubscriptionId && !sub.stripeSubscriptionId.startsWith("pending_")) {
      try {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      } catch {
        // Log and continue — don't block deletion if Stripe call fails
      }
    }

    // Anonymize E&O log entries (retain per privacy policy, 7-year window)
    await db.update(eoLog)
      .set({
        clientNameSnapshot: "Deleted User",
        clientEmailSnapshot: null,
        sentToEmail: null,
      })
      .where(eq(eoLog.workspaceId, workspaceId));

    // Nullify workspace references on users (avoids FK constraint during workspace deletion)
    await db.update(users)
      .set({ workspaceId: null })
      .where(eq(users.workspaceId, workspaceId));

    // Delete workspace — cascades to clients, letters, templates, subscriptions
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    // Delete the user's Better Auth records (sessions, accounts, then user)
    // Better Auth cascades sessions+accounts from users via onDelete cascade
    await db.delete(users).where(eq(users.id, userId));

    return reply.status(204).send();
  });
}
