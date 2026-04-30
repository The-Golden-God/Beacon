import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { subscriptions, workspaces } from "../db/schema.js";
import { requireAuth, requireWorkspace, requireAdmin } from "../middleware/requireAuth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

const PRICE_IDS: Record<string, string> = {
  solo: process.env.STRIPE_PRICE_SOLO!,
  agency: process.env.STRIPE_PRICE_AGENCY!,
  office: process.env.STRIPE_PRICE_OFFICE!,
};

export async function billingRoutes(app: FastifyInstance) {
  // Create Stripe checkout session
  app.post("/billing/checkout", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const { plan } = request.body as { plan: "solo" | "agency" | "office" };

    const priceId = PRICE_IDS[plan];
    if (!priceId) return reply.status(400).send({ error: "Invalid plan" });

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId));

    let customerId = sub.stripeCustomerId.startsWith("pending_") ? undefined : sub.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: request.session!.user.email,
        name: workspace.name,
        metadata: { workspaceId },
      });
      customerId = customer.id;
      await db.update(subscriptions).set({ stripeCustomerId: customerId }).where(eq(subscriptions.workspaceId, workspaceId));
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/settings/billing?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/upgrade`,
      metadata: { workspaceId },
    });

    return reply.send({ url: session.url });
  });

  // Stripe webhook
  app.post("/billing/webhook", {
    config: { rawBody: true },
  }, async (request, reply) => {
    const sig = request.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        (request as any).rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch {
      return reply.status(400).send({ error: "Invalid signature" });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata.workspaceId;
      if (workspaceId) {
        await db.update(subscriptions).set({
          stripeSubscriptionId: sub.id,
          stripePriceId: (sub.items.data[0] as any)?.price?.id,
          status: sub.status as any,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date(),
        }).where(eq(subscriptions.workspaceId, workspaceId));
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata.workspaceId;
      if (workspaceId) {
        await db.update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.workspaceId, workspaceId));
      }
    }

    return reply.send({ received: true });
  });

  // Create billing portal session
  app.post("/billing/portal", { preHandler: [requireAuth, requireWorkspace, requireAdmin] }, async (request, reply) => {
    const workspaceId = request.session!.user.workspaceId!;
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId));

    if (sub.stripeCustomerId.startsWith("pending_")) {
      return reply.status(400).send({ error: "No active subscription" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/settings/billing`,
    });

    return reply.send({ url: session.url });
  });
}
