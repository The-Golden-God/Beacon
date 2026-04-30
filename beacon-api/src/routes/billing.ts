import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { subscriptions, workspaces, users } from "../db/schema.js";
import { requireAuth, requireWorkspace, requireAdmin } from "../middleware/requireAuth.js";
import { sendWelcomeEmail } from "../lib/email.js";

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

    // Checkout completed — first payment, link subscription to workspace
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      const subscriptionId = session.subscription as string | undefined;
      if (workspaceId && subscriptionId) {
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any;
        await db.update(subscriptions).set({
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: stripeSub.items?.data[0]?.price?.id,
          status: stripeSub.status,
          currentPeriodStart: stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000) : undefined,
          currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : undefined,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end ?? false,
          updatedAt: new Date(),
        }).where(eq(subscriptions.workspaceId, workspaceId));

        // Send welcome email to workspace owner
        const [owner] = await db
          .select({ email: users.email, name: users.name })
          .from(users)
          .where(eq(users.workspaceId, workspaceId));
        if (owner) {
          const firstName = owner.name?.split(" ")[0] ?? "there";
          await sendWelcomeEmail({ to: owner.email, firstName }).catch(() => {});
        }
      }
    }

    // Subscription updated (plan change, renewal, cancellation scheduled)
    if (event.type === "customer.subscription.updated") {
      const stripeSub = event.data.object as any;
      const customerId = stripeSub.customer as string;
      await db.update(subscriptions).set({
        stripePriceId: stripeSub.items?.data[0]?.price?.id,
        status: stripeSub.status,
        currentPeriodStart: stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000) : undefined,
        currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : undefined,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end ?? false,
        updatedAt: new Date(),
      }).where(eq(subscriptions.stripeCustomerId, customerId));
    }

    // Subscription cancelled
    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object as Stripe.Subscription;
      const customerId = stripeSub.customer as string;
      await db.update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.stripeCustomerId, customerId));
    }

    // Payment failed — log for now (email handled by Stripe's built-in dunning)
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(`Payment failed for customer ${invoice.customer}: ${invoice.id}`);
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
