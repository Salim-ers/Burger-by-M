import Stripe from "stripe";
import { env } from "@/lib/env";
import { PaymentConfigurationError, type PaymentEvent, type PaymentProvider } from "./provider";

/**
 * Stripe : PaymentIntent + Payment Element (CB, Visa, Mastercard, Apple Pay, Google Pay selon disponibilité,
 * activés via automatic_payment_methods dans le tableau de bord Stripe).
 */
export function createStripeProvider(secretKey: string, webhookSecret: string): PaymentProvider {
  const stripe = new Stripe(secretKey, { maxNetworkRetries: 2, timeout: 15_000, appInfo: { name: "Burger By M" } });

  return {
    name: "stripe",

    async createPayment(input) {
      const pi = await stripe.paymentIntents.create(
        {
          amount: input.amountCents,
          currency: input.currency,
          automatic_payment_methods: { enabled: true },
          description: input.description,
          receipt_email: input.customerEmail ?? undefined,
          metadata: { orderId: input.orderId, orderNumber: input.orderNumber },
          statement_descriptor_suffix: "BURGER BY M",
        },
        { idempotencyKey: input.idempotencyKey },
      );
      if (!pi.client_secret) throw new Error("Stripe : client_secret absent");
      return { providerPaymentId: pi.id, clientSecret: pi.client_secret };
    },

    async retrievePayment(id) {
      const pi = await stripe.paymentIntents.retrieve(id);
      return { id: pi.id, status: mapStatus(pi.status), amountCents: pi.amount_received || pi.amount, metadataOrderId: pi.metadata?.orderId ?? null, clientSecret: pi.client_secret };
    },

    async cancelPayment(id) {
      try {
        await stripe.paymentIntents.cancel(id);
      } catch (err) {
        // Déjà annulé ou déjà payé : le webhook fera foi.
        if (!(err instanceof Stripe.errors.StripeInvalidRequestError)) throw err;
      }
    },

    async refund(id, amountCents, idempotencyKey) {
      const r = await stripe.refunds.create({ payment_intent: id, amount: amountCents, reason: "requested_by_customer" }, { idempotencyKey });
      return { refundId: r.id, amountCents: r.amount };
    },

    parseWebhook(rawBody, signature) {
      if (!signature) throw new Error("Signature Stripe absente");
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      return normalize(event);
    },
  };
}

function mapStatus(s: Stripe.PaymentIntent.Status) {
  if (s === "succeeded") return "succeeded" as const;
  if (s === "canceled") return "canceled" as const;
  return "pending" as const;
}

export function normalize(event: Stripe.Event): PaymentEvent {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      return { id: event.id, type: "payment.succeeded", providerPaymentId: pi.id, orderId: pi.metadata?.orderId ?? null, amountCents: pi.amount_received };
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      return { id: event.id, type: "payment.failed", providerPaymentId: pi.id, orderId: pi.metadata?.orderId ?? null, error: pi.last_payment_error?.message ?? null };
    }
    case "payment_intent.canceled": {
      const pi = event.data.object;
      return { id: event.id, type: "payment.canceled", providerPaymentId: pi.id, orderId: pi.metadata?.orderId ?? null };
    }
    case "charge.refunded": {
      const ch = event.data.object;
      const pid = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id;
      if (!pid) return { id: event.id, type: "ignored", rawType: event.type };
      return { id: event.id, type: "payment.refunded", providerPaymentId: pid, amountRefundedCents: ch.amount_refunded, amountCents: ch.amount };
    }
    default:
      return { id: event.id, type: "ignored", rawType: event.type };
  }
}

let cached: PaymentProvider | null = null;

/** Prestataire configuré, ou erreur explicite si les clés Stripe manquent. */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const e = env();
  if (!e.STRIPE_SECRET_KEY || !e.STRIPE_WEBHOOK_SECRET) throw new PaymentConfigurationError("Paiement en ligne non configuré (clés Stripe absentes).");
  cached = createStripeProvider(e.STRIPE_SECRET_KEY, e.STRIPE_WEBHOOK_SECRET);
  return cached;
}
