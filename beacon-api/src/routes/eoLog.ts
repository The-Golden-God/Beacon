import type { FastifyInstance } from "fastify";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import PDFDocument from "pdfkit";
import { db } from "../db/index.js";
import { eoLog, letters, workspaces } from "../db/schema.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";

const SCENARIO_LABELS: Record<string, string> = {
  pre_renewal: "Pre-Renewal Outreach",
  rate_increase: "Rate Increase Explanation",
  new_client_welcome: "New Client Welcome",
  claims_checkin: "Claims Check-In",
  coverage_gap: "Coverage Gap Notice",
  annual_review: "Annual Review Invitation",
};

function fmt(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

  // PDF export — streams a formatted E&O log as a downloadable PDF
  app.get("/log/export", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const query = request.query as { from?: string; to?: string };

    const conditions = [eq(eoLog.workspaceId, workspaceId)];
    if (query.from) conditions.push(gte(eoLog.sentAt, new Date(query.from)));
    if (query.to) conditions.push(lte(eoLog.sentAt, new Date(query.to)));

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

    const rows = await db
      .select({
        id: eoLog.id,
        clientNameSnapshot: eoLog.clientNameSnapshot,
        clientEmailSnapshot: eoLog.clientEmailSnapshot,
        letterSubjectSnapshot: eoLog.letterSubjectSnapshot,
        letterContentSnapshot: eoLog.letterContentSnapshot,
        sendMethod: eoLog.sendMethod,
        sentToEmail: eoLog.sentToEmail,
        sentAt: eoLog.sentAt,
        contentHash: eoLog.contentHash,
        scenario: letters.scenario,
      })
      .from(eoLog)
      .leftJoin(letters, eq(eoLog.letterId, letters.id))
      .where(and(...conditions))
      .orderBy(desc(eoLog.sentAt))
      .limit(2000);

    const agencyName = workspace?.name ?? "Your Agency";
    const generatedAt = new Date().toLocaleString("en-US", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC";
    const dateRange = query.from || query.to
      ? `${query.from ? fmt(query.from) : "All time"} – ${query.to ? fmt(query.to) : "Present"}`
      : "All time";

    const filename = `eo-log-${new Date().toISOString().slice(0, 10)}.pdf`;
    reply.raw.setHeader("Content-Type", "application/pdf");
    reply.raw.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50, size: "LETTER", autoFirstPage: true, bufferPages: true });
    doc.pipe(reply.raw);

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(18).font("Helvetica-Bold").text("E&O Communication Log", { align: "left" });
    doc.fontSize(11).font("Helvetica").fillColor("#555555")
      .text(agencyName, { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#888888")
      .text(`Period: ${dateRange}   ·   Generated: ${generatedAt}   ·   ${rows.length} record${rows.length === 1 ? "" : "s"}`, { align: "left" });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#dddddd").lineWidth(1).stroke();
    doc.moveDown(0.5);

    if (rows.length === 0) {
      doc.fontSize(10).fillColor("#555555").text("No entries found for the selected period.", { align: "center" });
      doc.end();
      return;
    }

    // ── Table ─────────────────────────────────────────────────────────────────
    const COL = { date: 50, client: 130, scenario: 270, method: 380, hash: 440 };
    const PAGE_BOTTOM = 730;

    function drawTableHeader() {
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#333333");
      doc.text("Date Sent", COL.date, doc.y, { width: 75 });
      const headerY = doc.y - doc.currentLineHeight();
      doc.text("Client / Email", COL.client, headerY, { width: 135 });
      doc.text("Scenario", COL.scenario, headerY, { width: 105 });
      doc.text("Method", COL.method, headerY, { width: 55 });
      doc.text("Hash (SHA-256)", COL.hash, headerY, { width: 122 });
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
      doc.moveDown(0.3);
    }

    drawTableHeader();

    let rowIndex = 0;
    for (const entry of rows) {
      // Check if we're near the bottom of the page
      if (doc.y > PAGE_BOTTOM) {
        doc.addPage();
        drawTableHeader();
      }

      const rowY = doc.y;
      const bg = rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff";
      const clientLine2 = entry.sentToEmail ?? entry.clientEmailSnapshot ?? "";
      const hashShort = entry.contentHash ? entry.contentHash.slice(0, 16) + "…" : "—";
      const scenarioLabel = SCENARIO_LABELS[entry.scenario ?? ""] ?? (entry.scenario?.replace(/_/g, " ") ?? "—");

      // Row background
      const rowHeight = clientLine2 ? 28 : 18;
      doc.rect(50, rowY - 2, 512, rowHeight).fillColor(bg).fill();

      doc.fontSize(8).font("Helvetica").fillColor("#333333");
      doc.text(fmt(entry.sentAt), COL.date, rowY, { width: 75 });
      doc.font("Helvetica-Bold").text(entry.clientNameSnapshot ?? "—", COL.client, rowY, { width: 135 });
      if (clientLine2) {
        doc.font("Helvetica").fillColor("#888888").fontSize(7)
          .text(clientLine2, COL.client, rowY + 10, { width: 135 });
      }
      doc.font("Helvetica").fillColor("#555555").fontSize(8)
        .text(scenarioLabel, COL.scenario, rowY, { width: 105 });
      doc.text((entry.sendMethod ?? "manual").charAt(0).toUpperCase() + (entry.sendMethod ?? "manual").slice(1), COL.method, rowY, { width: 55 });
      doc.font("Helvetica").fillColor("#999999").fontSize(7)
        .text(hashShort, COL.hash, rowY, { width: 122 });

      doc.moveDown(clientLine2 ? 1.5 : 0.8);
      rowIndex++;
    }

    // ── Disclaimer footer ─────────────────────────────────────────────────────
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#dddddd").lineWidth(0.5).stroke();
    doc.moveDown(0.5);
    doc.fontSize(7).fillColor("#aaaaaa")
      .text(
        "This log is generated by Beacon and is provided as a convenience record of communications sent through the platform. " +
        "It does not constitute a complete E&O compliance record and may not satisfy all regulatory, legal, or carrier requirements. " +
        "You remain solely responsible for maintaining all records required by applicable law and your E&O carrier.",
        50,
        doc.y,
        { width: 512, align: "left" }
      );

    // Page numbers
    const pages = (doc as any).bufferedPageRange?.() ?? { start: 0, count: 1 };
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      doc.fontSize(7).fillColor("#aaaaaa")
        .text(`Page ${i + 1} of ${pages.count}`, 50, 760, { width: 512, align: "right" });
    }

    doc.end();
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
