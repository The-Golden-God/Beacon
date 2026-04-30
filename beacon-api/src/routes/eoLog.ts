import type { FastifyInstance } from "fastify";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { eoLog, letters } from "../db/schema.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";

export async function eoLogRoutes(app: FastifyInstance) {
  app.get("/log", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const query = request.query as {
      clientId?: string;
      from?: string;
      to?: string;
      limit?: string;
      page?: string;
    };

    const page = parseInt(query.page ?? "1");
    const limit = Math.min(parseInt(query.limit ?? "50"), 200);
    const offset = (page - 1) * limit;

    const conditions = [eq(eoLog.workspaceId, workspaceId)];
    if (query.clientId) conditions.push(eq(eoLog.clientId, query.clientId));
    if (query.from) conditions.push(gte(eoLog.sentAt, new Date(query.from)));
    if (query.to) conditions.push(lte(eoLog.sentAt, new Date(query.to)));

    const rows = await db
      .select({
        id: eoLog.id,
        workspaceId: eoLog.workspaceId,
        letterId: eoLog.letterId,
        clientId: eoLog.clientId,
        sentByUserId: eoLog.sentByUserId,
        letterSubjectSnapshot: eoLog.letterSubjectSnapshot,
        letterContentSnapshot: eoLog.letterContentSnapshot,
        clientNameSnapshot: eoLog.clientNameSnapshot,
        clientEmailSnapshot: eoLog.clientEmailSnapshot,
        sendMethod: eoLog.sendMethod,
        sentToEmail: eoLog.sentToEmail,
        externalMessageId: eoLog.externalMessageId,
        sentAt: eoLog.sentAt,
        contentHash: eoLog.contentHash,
        scenario: letters.scenario,
      })
      .from(eoLog)
      .leftJoin(letters, eq(eoLog.letterId, letters.id))
      .where(and(...conditions))
      .orderBy(desc(eoLog.sentAt))
      .limit(limit)
      .offset(offset);

    return reply.send({ log: rows, page, limit });
  });

  app.get("/log/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };

    const [entry] = await db
      .select()
      .from(eoLog)
      .where(and(eq(eoLog.id, id), eq(eoLog.workspaceId, workspaceId)));

    if (!entry) return reply.status(404).send({ error: "Not found" });
    return reply.send({ entry });
  });
}
