import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { templates } from "../db/schema.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";

export async function templateRoutes(app: FastifyInstance) {
  app.get("/templates", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;

    const rows = await db
      .select()
      .from(templates)
      .where(eq(templates.workspaceId, workspaceId));

    return reply.send({ templates: rows });
  });

  app.post("/templates", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;
    const body = request.body as { name: string; scenario: string; content: string };

    const [tmpl] = await db.insert(templates).values({
      workspaceId,
      createdByUserId: userId,
      name: body.name,
      scenario: body.scenario as any,
      content: body.content,
    }).returning();

    return reply.status(201).send({ template: tmpl });
  });

  app.patch("/templates/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; content?: string };

    const [updated] = await db.update(templates)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Not found" });
    return reply.send({ template: updated });
  });

  app.delete("/templates/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };

    await db.delete(templates)
      .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)));

    return reply.status(204).send();
  });
}
