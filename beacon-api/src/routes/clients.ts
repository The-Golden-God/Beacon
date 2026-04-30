import type { FastifyInstance } from "fastify";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { clients } from "../db/schema.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";

export async function clientRoutes(app: FastifyInstance) {
  app.get("/clients", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const query = request.query as { search?: string; page?: string; limit?: string };

    const page = parseInt(query.page ?? "1");
    const limit = Math.min(parseInt(query.limit ?? "50"), 2000);
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(clients)
      .where(eq(clients.workspaceId, workspaceId))
      .orderBy(asc(clients.lastName), asc(clients.firstName))
      .limit(limit)
      .offset(offset);

    return reply.send({ clients: rows, page, limit });
  });

  app.post("/clients", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const body = request.body as {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      policyType?: string;
      policyNumber?: string;
      carrier?: string;
      premium?: string;
      renewalDate?: string;
    };

    const [client] = await db.insert(clients).values({
      workspaceId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      policyType: body.policyType as any,
      policyNumber: body.policyNumber,
      carrier: body.carrier,
      premium: body.premium,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
    }).returning();

    return reply.status(201).send({ client });
  });

  app.get("/clients/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)));

    if (!client) return reply.status(404).send({ error: "Not found" });
    return reply.send({ client });
  });

  app.patch("/clients/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const allowed = [
      "firstName", "lastName", "email", "phone", "policyType",
      "policyNumber", "carrier", "premium", "renewalDate", "doNotContact", "notes",
    ];
    const patch = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k))
    );
    if (patch.renewalDate) patch.renewalDate = new Date(patch.renewalDate as string);

    const [updated] = await db.update(clients)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Not found" });
    return reply.send({ client: updated });
  });

  app.delete("/clients/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };

    const [deleted] = await db.delete(clients)
      .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)))
      .returning();

    if (!deleted) return reply.status(404).send({ error: "Not found" });
    return reply.status(204).send();
  });

  // Bulk CSV import — accepts array of client rows
  app.post("/clients/import", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const body = request.body as { clients?: Array<Record<string, string>>; rows?: Array<Record<string, string>> };
    const rows = body.clients ?? body.rows ?? [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return reply.status(400).send({ error: "No rows provided" });
    }
    if (rows.length > 1000) {
      return reply.status(400).send({ error: "Max 1000 rows per import" });
    }

    const importBatchId = crypto.randomUUID();

    const values = rows.map((row) => ({
      workspaceId,
      importBatchId,
      firstName: String(row.firstName ?? row.first_name ?? "").trim(),
      lastName: String(row.lastName ?? row.last_name ?? "").trim(),
      email: row.email ? String(row.email).trim() : undefined,
      phone: row.phone ? String(row.phone).trim() : undefined,
      carrier: row.carrier ? String(row.carrier).trim() : undefined,
      premium: row.premium ? String(row.premium).replace(/[^0-9.]/g, "") : undefined,
      renewalDate: row.renewalDate || row.renewal_date
        ? new Date(row.renewalDate ?? row.renewal_date)
        : undefined,
    })).filter((v) => v.firstName && v.lastName);

    const inserted = await db.insert(clients).values(values).returning({ id: clients.id });

    return reply.status(201).send({ imported: inserted.length, batchId: importBatchId });
  });
}
