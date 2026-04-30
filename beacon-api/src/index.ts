import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import rawBody from "fastify-raw-body";
import { auth } from "./lib/auth.js";
import { authRoutes } from "./routes/auth.js";
import { checkLoginRate } from "./lib/ratelimit.js";
import { workspaceRoutes } from "./routes/workspaces.js";
import { clientRoutes } from "./routes/clients.js";
import { letterRoutes } from "./routes/letters.js";
import { eoLogRoutes } from "./routes/eoLog.js";
import { templateRoutes } from "./routes/templates.js";
import { billingRoutes } from "./routes/billing.js";
import { teamRoutes } from "./routes/team.js";
import { emailRoutes } from "./routes/email.js";

const app = Fastify({
  logger: process.env.NODE_ENV !== "production",
  trustProxy: true,
});

// ─── Plugins ──────────────────────────────────────────────────────────────────

await app.register(helmet, {
  // API only serves JSON — restrict everything by default
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: "deny" },
  noSniff: true,
  referrerPolicy: { policy: "no-referrer" },
});

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

await app.register(cookie);

await app.register(rawBody, {
  field: "rawBody",
  global: false, // only on routes that opt in via config.rawBody = true
  encoding: "utf8",
  runFirst: true,
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  redis: undefined, // TODO: add Upstash Redis for distributed rate limiting in prod
});

// ─── Login rate limiting ──────────────────────────────────────────────────────
// Applied before Better Auth handles /api/auth/sign-in/email

app.addHook("onRequest", async (request, reply) => {
  if (request.url !== "/api/auth/sign-in/email" || request.method !== "POST") return;
  const body = request.body as { email?: string } | undefined;
  const ip = (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? request.socket.remoteAddress
    ?? "unknown";

  const checks = await Promise.all([
    body?.email ? checkLoginRate(`email:${body.email}`) : Promise.resolve({ allowed: true, remaining: 999, reset: 0 }),
    checkLoginRate(`ip:${ip}`),
  ]);

  const blocked = checks.find((c) => !c.allowed);
  if (blocked) {
    reply.status(429).send({
      error: "Too many login attempts. Please wait before trying again.",
      retryAfter: Math.ceil((blocked.reset - Date.now()) / 1000),
    });
  }
});

// ─── Better Auth handler ──────────────────────────────────────────────────────
// Catches all /api/auth/* requests

app.all("/api/auth/*", async (request, reply) => {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) webHeaders.append(key, v);
    } else {
      webHeaders.set(key, value);
    }
  }

  const response = await auth.handler(
    new Request(
      `${request.protocol}://${request.hostname}${request.url}`,
      {
        method: request.method,
        headers: webHeaders,
        body: request.method !== "GET" && request.method !== "HEAD"
          ? JSON.stringify(request.body)
          : undefined,
      }
    )
  );

  reply.status(response.status);
  response.headers.forEach((value, key) => reply.header(key, value));
  const body = await response.text();
  return reply.send(body);
});

// ─── App Routes ───────────────────────────────────────────────────────────────

await app.register(authRoutes, { prefix: "/api" });
await app.register(workspaceRoutes, { prefix: "/api" });
await app.register(clientRoutes, { prefix: "/api" });
await app.register(letterRoutes, { prefix: "/api" });
await app.register(eoLogRoutes, { prefix: "/api" });
await app.register(templateRoutes, { prefix: "/api" });
await app.register(billingRoutes, { prefix: "/api" });
await app.register(teamRoutes, { prefix: "/api" });
await app.register(emailRoutes, { prefix: "/api" });

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", async () => ({ status: "ok", ts: Date.now() }));

// ─── Start ────────────────────────────────────────────────────────────────────

const port = parseInt(process.env.PORT ?? "4000");
await app.listen({ port, host: "0.0.0.0" });
console.log(`beacon-api listening on port ${port}`);
