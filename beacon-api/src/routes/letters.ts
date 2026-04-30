import type { FastifyInstance } from "fastify";
import { eq, and, desc, sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db/index.js";
import { letters, clients, eoLog, workspaces, subscriptions, users } from "../db/schema.js";
import { sendViaGmail } from "../lib/gmail.js";
import { sendViaOutlook } from "../lib/outlook.js";
import { safeDecrypt, encryptToken } from "../lib/crypto.js";
import { checkLetterGenRate } from "../lib/ratelimit.js";
import { requireAuth, requireWorkspace } from "../middleware/requireAuth.js";
import { hashContent } from "../lib/utils.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LETTER_SYSTEM_PROMPT = `You are an AI assistant that helps independent insurance agents write professional, personalized client letters.

Write letters that:
- Sound like they came from the agent personally (warm, professional, not corporate)
- Are concise (150–250 words for most scenarios)
- Include the agent's voice settings if provided
- Always end with the agent's signature block
- Include the E&O disclaimer at the very end in a smaller/italicized note

Never make up specific policy details. Use placeholders like [policy number] only when the data wasn't provided.`;

const SCENARIO_PROMPTS: Record<string, string> = {
  pre_renewal: "Write a pre-renewal outreach letter to check in before their policy renews. Be warm and proactive. Mention the renewal date if provided. Offer to review coverage.",
  rate_increase: "Write a letter explaining a rate increase. Acknowledge the cost increase honestly, explain it briefly (market conditions, not their fault), and emphasize the value of continued coverage. Do not apologize excessively.",
  new_client_welcome: "Write a welcome letter for a new client. Express genuine appreciation, set expectations for the relationship, and invite them to reach out with questions.",
  claims_checkin: "Write a brief check-in letter for a client who recently filed a claim. Express empathy, confirm the agent is available, and provide reassurance.",
  coverage_gap: "Write a letter notifying a client of a potential coverage gap in their policy. Be factual, not alarmist. Recommend a review meeting.",
  annual_review: "Write an annual review invitation letter. Be warm, emphasize the importance of reviewing coverage annually, and make scheduling easy.",
};

export async function letterRoutes(app: FastifyInstance) {
  // Generate a letter (streaming SSE)
  app.post("/letters/generate", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;

    const body = request.body as {
      clientId: string;
      scenario: string;
      customInstructions?: string;
    };

    // Rate limit: 100 generations per hour per workspace
    const rateCheck = await checkLetterGenRate(workspaceId);
    if (!rateCheck.allowed) {
      return reply.status(429).send({ error: "Letter generation rate limit reached. Try again in an hour." });
    }

    // Check trial limits
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId));
    if (sub.status === "trialing" && sub.trialLettersUsed >= sub.trialLettersLimit) {
      return reply.status(402).send({ error: "Trial limit reached. Please upgrade to continue." });
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, body.clientId), eq(clients.workspaceId, workspaceId)));

    if (!client) return reply.status(404).send({ error: "Client not found" });

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

    const scenarioInstructions = SCENARIO_PROMPTS[body.scenario];
    if (!scenarioInstructions) return reply.status(400).send({ error: "Invalid scenario" });

    const userPrompt = buildUserPrompt({ client, workspace, scenario: body.scenario, customInstructions: body.customInstructions });

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.flushHeaders();

    let fullContent = "";
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const stream = await anthropic.messages.stream({
        model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: LETTER_SYSTEM_PROMPT,
            // Prompt caching — system prompt is stable across requests
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: `Scenario: ${scenarioInstructions}`,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userPrompt }],
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          fullContent += event.delta.text;
          reply.raw.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
        if (event.type === "message_delta" && event.usage) {
          completionTokens = event.usage.output_tokens;
        }
        if (event.type === "message_start" && event.message.usage) {
          promptTokens = event.message.usage.input_tokens;
        }
      }

      // Save the draft letter
      const [letter] = await db.insert(letters).values({
        workspaceId,
        clientId: client.id,
        authorUserId: userId,
        scenario: body.scenario as any,
        status: "draft",
        subject: buildSubject(body.scenario, client),
        content: fullContent,
        promptTokens,
        completionTokens,
      }).returning();

      // Increment trial usage
      if (sub.status === "trialing") {
        await db.update(subscriptions)
          .set({ trialLettersUsed: sub.trialLettersUsed + 1 })
          .where(eq(subscriptions.workspaceId, workspaceId));
      }

      reply.raw.write(`data: ${JSON.stringify({ done: true, letterId: letter.id })}\n\n`);
    } catch (err) {
      reply.raw.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });

  app.get("/letters", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const query = request.query as { clientId?: string; status?: string; limit?: string };

    const conditions = [eq(letters.workspaceId, workspaceId)];
    if (query.clientId) conditions.push(eq(letters.clientId, query.clientId));
    if (query.status) conditions.push(eq(letters.status, query.status as any));

    const rows = await db
      .select({
        id: letters.id,
        workspaceId: letters.workspaceId,
        clientId: letters.clientId,
        authorUserId: letters.authorUserId,
        scenario: letters.scenario,
        status: letters.status,
        subject: letters.subject,
        content: letters.content,
        version: letters.version,
        submittedForApprovalAt: letters.submittedForApprovalAt,
        approvedByUserId: letters.approvedByUserId,
        approvedAt: letters.approvedAt,
        rejectionReason: letters.rejectionReason,
        promptTokens: letters.promptTokens,
        completionTokens: letters.completionTokens,
        templateId: letters.templateId,
        createdAt: letters.createdAt,
        updatedAt: letters.updatedAt,
        clientName: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
      })
      .from(letters)
      .leftJoin(clients, eq(letters.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(letters.createdAt))
      .limit(parseInt(query.limit ?? "50"));

    return reply.send({ letters: rows });
  });

  app.get("/letters/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };

    const [letter] = await db
      .select()
      .from(letters)
      .where(and(eq(letters.id, id), eq(letters.workspaceId, workspaceId)));

    if (!letter) return reply.status(404).send({ error: "Not found" });
    return reply.send({ letter });
  });

  app.patch("/letters/:id", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };
    const body = request.body as { subject?: string; content?: string; status?: string };

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.subject) patch.subject = body.subject;
    if (body.content) patch.content = body.content;
    if (body.status) patch.status = body.status;

    const [updated] = await db.update(letters)
      .set(patch)
      .where(and(eq(letters.id, id), eq(letters.workspaceId, workspaceId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Not found" });
    return reply.send({ letter: updated });
  });

  // Mark a letter as sent, dispatch via Gmail/Outlook if requested, write E&O log entry
  app.post("/letters/:id/send", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const userId = request.session!.user.id;
    const { id } = request.params as { id: string };
    const { method, toEmail } = request.body as { method: "gmail" | "outlook" | "manual"; toEmail?: string };

    const [letter] = await db
      .select()
      .from(letters)
      .where(and(eq(letters.id, id), eq(letters.workspaceId, workspaceId)));

    if (!letter) return reply.status(404).send({ error: "Not found" });
    if (letter.status === "sent") return reply.status(409).send({ error: "Already sent" });

    const [client] = await db.select().from(clients).where(eq(clients.id, letter.clientId));
    const recipientEmail = toEmail ?? client.email;

    let externalMessageId: string | undefined;

    if (method === "gmail" || method === "outlook") {
      if (!recipientEmail) {
        return reply.status(400).send({ error: "No recipient email address available" });
      }

      const [sender] = await db
        .select({
          gmailAccessToken: users.gmailAccessToken,
          gmailRefreshToken: users.gmailRefreshToken,
          gmailTokenExpiry: users.gmailTokenExpiry,
          gmailEmail: users.gmailEmail,
          outlookAccessToken: users.outlookAccessToken,
          outlookRefreshToken: users.outlookRefreshToken,
          outlookTokenExpiry: users.outlookTokenExpiry,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (method === "gmail") {
        const accessToken = safeDecrypt(sender.gmailAccessToken);
        const refreshToken = safeDecrypt(sender.gmailRefreshToken);
        if (!accessToken || !refreshToken) {
          return reply.status(400).send({ error: "Gmail not connected" });
        }
        const result = await sendViaGmail({
          accessToken,
          refreshToken,
          tokenExpiry: sender.gmailTokenExpiry,
          fromEmail: sender.gmailEmail!,
          toEmail: recipientEmail,
          subject: letter.subject,
          body: letter.content,
        });
        externalMessageId = result.messageId;
        if (result.newAccessToken) {
          await db.update(users).set({
            gmailAccessToken: encryptToken(result.newAccessToken),
            gmailTokenExpiry: result.newExpiry,
            updatedAt: new Date(),
          }).where(eq(users.id, userId));
        }
      } else {
        const accessToken = safeDecrypt(sender.outlookAccessToken);
        const refreshToken = safeDecrypt(sender.outlookRefreshToken);
        if (!accessToken || !refreshToken) {
          return reply.status(400).send({ error: "Outlook not connected" });
        }
        const result = await sendViaOutlook({
          accessToken,
          refreshToken,
          tokenExpiry: sender.outlookTokenExpiry,
          toEmail: recipientEmail,
          subject: letter.subject,
          body: letter.content,
        });
        externalMessageId = result.messageId;
        if (result.newAccessToken) {
          await db.update(users).set({
            outlookAccessToken: encryptToken(result.newAccessToken),
            outlookTokenExpiry: result.newExpiry,
            updatedAt: new Date(),
          }).where(eq(users.id, userId));
        }
      }
    }

    const contentHash = hashContent(letter.content);

    const [logEntry] = await db.insert(eoLog).values({
      workspaceId,
      letterId: letter.id,
      clientId: letter.clientId,
      sentByUserId: userId,
      letterSubjectSnapshot: letter.subject,
      letterContentSnapshot: letter.content,
      clientNameSnapshot: `${client.firstName} ${client.lastName}`,
      clientEmailSnapshot: recipientEmail ?? undefined,
      sendMethod: method,
      sentToEmail: recipientEmail ?? undefined,
      externalMessageId,
      contentHash,
    }).returning();

    await db.update(letters)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(letters.id, id));

    return reply.status(201).send({ logEntryId: logEntry.id });
  });

  // Submit for approval (Agency/Office)
  app.post("/letters/:id/submit", { preHandler: [requireAuth, requireWorkspace] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { id } = request.params as { id: string };

    const [updated] = await db.update(letters)
      .set({ status: "pending_approval", submittedForApprovalAt: new Date(), updatedAt: new Date() })
      .where(and(eq(letters.id, id), eq(letters.workspaceId, workspaceId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Not found" });
    return reply.send({ letter: updated });
  });
}

function buildUserPrompt(params: {
  client: typeof clients.$inferSelect;
  workspace: typeof workspaces.$inferSelect;
  scenario: string;
  customInstructions?: string;
}): string {
  const { client, workspace, customInstructions } = params;
  const lines: string[] = [
    `Client Name: ${client.firstName} ${client.lastName}`,
  ];
  if (client.email) lines.push(`Client Email: ${client.email}`);
  if (client.policyType) lines.push(`Policy Type: ${client.policyType}`);
  if (client.carrier) lines.push(`Carrier: ${client.carrier}`);
  if (client.premium) lines.push(`Annual Premium: $${client.premium}`);
  if (client.renewalDate) lines.push(`Renewal Date: ${client.renewalDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`);
  if (workspace.agencyVoice) lines.push(`\nAgent Voice/Tone: ${workspace.agencyVoice}`);
  if (workspace.signatureBlock) lines.push(`Signature Block: ${workspace.signatureBlock}`);
  if (workspace.eoDisclaimer) lines.push(`E&O Disclaimer to append: ${workspace.eoDisclaimer}`);
  if (customInstructions) lines.push(`\nAdditional instructions: ${customInstructions}`);

  return lines.join("\n");
}

function buildSubject(scenario: string, client: typeof clients.$inferSelect): string {
  const name = `${client.firstName} ${client.lastName}`;
  const subjects: Record<string, string> = {
    pre_renewal: `Policy Renewal Reminder — ${name}`,
    rate_increase: `Important Update About Your Policy — ${name}`,
    new_client_welcome: `Welcome to [Agency Name] — ${name}`,
    claims_checkin: `Following Up on Your Recent Claim — ${name}`,
    coverage_gap: `Coverage Review — ${name}`,
    annual_review: `Annual Policy Review — ${name}`,
  };
  return subjects[scenario] ?? `Letter for ${name}`;
}
