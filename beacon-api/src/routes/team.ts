import type { FastifyInstance } from "fastify";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, invites, letters, workspaces } from "../db/schema.js";
import { requireAuth, requireWorkspace, requireAdmin } from "../middleware/requireAuth.js";
import { sendTeamInviteEmail } from "../lib/email.js";
import crypto from "crypto";

export async function teamRoutes(app: FastifyInstance) {
  // Get invite metadata (used by invite accept page — public endpoint)
  app.get("/team/invite/:token/info", async (request, reply) => {
    const { token } = request.params as { token: string };

    const [invite] = await db
      .select({ token: invites.token, email: invites.email, workspaceId: invites.workspaceId, expiresAt: invites.expiresAt, acceptedAt: invites.acceptedAt })
      .from(invites)
      .where(eq(invites.token, token));

    if (!invite) return reply.status(404).send({ token, email: "", workspaceName: "", expired: true });

    const expired = invite.expiresAt < new Date() || !!invite.acceptedAt;

    const [workspace] = await db.select({ name: workspaces.name }).from(workspaces).where(eq(workspaces.id, invite.workspaceId));

    return reply.send({ token, email: invite.email, workspaceName: workspace?.name ?? "your agency", expired });
  });

  // List team members (active users + pending invites)
  app.get("/team", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;

    const activeMembers = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.workspaceId, workspaceId));

    const pendingInvites = await db
      .select({ id: invites.id, email: invites.email, role: invites.role, createdAt: invites.createdAt })
      .from(invites)
      .where(and(
        eq(invites.workspaceId, workspaceId),
        isNull(invites.acceptedAt),
        gt(invites.expiresAt, new Date()),
      ));

    const members = [
      ...activeMembers.map((m) => ({ ...m, status: "active" as const })),
      ...pendingInvites.map((i) => ({ id: i.id, name: "", email: i.email, role: i.role, createdAt: i.createdAt, status: "invited" as const })),
    ];

    return reply.send({ members });
  });

  // Remove a team member
  app.delete("/team/:id", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const requesterId = request.session!.user.id;
    const { id } = request.params as { id: string };

    if (id === requesterId) {
      return reply.status(400).send({ error: "Cannot remove yourself" });
    }

    // Try active user first
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, id), eq(users.workspaceId, workspaceId)));

    if (user) {
      await db.update(users)
        .set({ workspaceId: null, updatedAt: new Date() })
        .where(eq(users.id, id));
      return reply.send({ ok: true });
    }

    // Try pending invite
    const [invite] = await db
      .select({ id: invites.id })
      .from(invites)
      .where(and(eq(invites.id, id), eq(invites.workspaceId, workspaceId)));

    if (invite) {
      await db.delete(invites).where(eq(invites.id, id));
      return reply.send({ ok: true });
    }

    return reply.status(404).send({ error: "Not found" });
  });

  // Invite a team member
  app.post("/team/invite", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;
    const { email, role } = request.body as { email: string; role: "admin" | "agent" };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invite] = await db.insert(invites).values({
      workspaceId,
      invitedByUserId: userId,
      email,
      role,
      token,
      expiresAt,
    }).returning();

    // Fetch inviter name + agency name for email
    const [inviter] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    const [workspace] = await db.select({ name: workspaces.name }).from(workspaces).where(eq(workspaces.id, workspaceId));
    const inviterFirstName = inviter?.name?.split(" ")[0] ?? "Your colleague";
    const agencyName = workspace?.name ?? "the agency";

    await sendTeamInviteEmail({
      to: email,
      inviterFirstName,
      agencyName,
      role,
      token: invite.token,
    });

    return reply.status(201).send({ invite: { id: invite.id, email: invite.email } });
  });

  // Accept an invite (called when new user registers via invite link)
  app.post("/team/invite/:token/accept", { preHandler: requireAuth }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const userId = request.session!.user.id;

    const [invite] = await db
      .select()
      .from(invites)
      .where(and(eq(invites.token, token)));

    if (!invite) return reply.status(404).send({ error: "Invite not found" });
    if (invite.acceptedAt) return reply.status(409).send({ error: "Invite already used" });
    if (invite.expiresAt < new Date()) return reply.status(410).send({ error: "Invite expired" });

    await db.update(users)
      .set({ workspaceId: invite.workspaceId, role: invite.role })
      .where(eq(users.id, userId));

    await db.update(invites)
      .set({ acceptedAt: new Date() })
      .where(eq(invites.token, token));

    return reply.send({ workspaceId: invite.workspaceId });
  });

  // Approval queue (Agency/Office)
  app.get("/queue", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;

    const pending = await db
      .select()
      .from(letters)
      .where(and(eq(letters.workspaceId, workspaceId), eq(letters.status, "pending_approval")));

    return reply.send({ queue: pending });
  });

  // Approve a letter
  app.post("/queue/:letterId/approve", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;
    const { letterId } = request.params as { letterId: string };

    const [updated] = await db.update(letters)
      .set({ status: "approved", approvedByUserId: userId, approvedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(letters.id, letterId), eq(letters.workspaceId, workspaceId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Not found" });
    return reply.send({ letter: updated });
  });

  // Reject a letter
  app.post("/queue/:letterId/reject", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { letterId } = request.params as { letterId: string };
    const { reason } = request.body as { reason: string };

    const [updated] = await db.update(letters)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(and(eq(letters.id, letterId), eq(letters.workspaceId, workspaceId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Not found" });
    return reply.send({ letter: updated });
  });
}
