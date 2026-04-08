import { Router } from "express";
import Stripe from "stripe";
import { PlanTier, SubscriptionStatus } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth } from "../../middleware/auth.js";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export async function billingWebhookHandler(rawBody: Buffer, signature: string | string[] | undefined) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET || typeof signature !== "string") {
    return;
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { planTier: PlanTier.PREMIUM }
    });

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeCustomerId: session.customer?.toString(),
        stripeSubscription: session.subscription?.toString(),
        status: SubscriptionStatus.ACTIVE
      },
      create: {
        userId,
        stripeCustomerId: session.customer?.toString(),
        stripeSubscription: session.subscription?.toString(),
        status: SubscriptionStatus.ACTIVE
      }
    });
  }
}

export const billingRouter = Router();

billingRouter.post(
  "/checkout",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!stripe || !env.STRIPE_PRICE_ID_MONTHLY) {
      res.status(501).json({ message: "Stripe is not configured yet." });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: env.STRIPE_PRICE_ID_MONTHLY,
          quantity: 1
        }
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?upgraded=1`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: req.user!.email,
      metadata: {
        userId: req.user!.id
      }
    });

    res.json({ url: session.url });
  }),
);

billingRouter.post(
  "/portal",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!stripe) {
      res.status(501).json({ message: "Stripe is not configured yet." });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id }
    });

    if (!subscription?.stripeCustomerId) {
      res.status(404).json({ message: "No billing profile found." });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`
    });

    res.json({ url: session.url });
  }),
);
