import { after } from "next/server";
import { getDb } from "@/db/client";
import { stripeConfigured } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments/stripe";
import { applyPaymentEvent } from "@/features/orders/service";
import { onNewKitchenOrder } from "@/features/orders/notify";
import { json } from "@/lib/security/http";

export const dynamic = "force-dynamic";

/**
 * Webhook Stripe — seule source de vérité du paiement.
 * Signature vérifiée sur le corps brut ; traitement idempotent (événement enregistré dans la même transaction).
 * Événements à activer : payment_intent.succeeded, payment_intent.payment_failed, payment_intent.canceled, charge.refunded.
 */
export async function POST(req: Request) {
  if (!stripeConfigured()) return json({ error: "Paiement non configuré." }, 503);
  const raw = await req.text();
  if (raw.length > 1_000_000) return json({ error: "Trop volumineux." }, 413);

  let event;
  try {
    event = getPaymentProvider().parseWebhook(raw, req.headers.get("stripe-signature"));
  } catch {
    return json({ error: "Signature invalide." }, 400);
  }

  try {
    const db = getDb();
    const result = await applyPaymentEvent(db, event);
    if (result.newKitchenOrderId) after(() => onNewKitchenOrder(db, result.newKitchenOrderId!));
    return json({ received: true, duplicate: result.duplicate });
  } catch (err) {
    // 500 : Stripe renverra l'événement (le traitement n'a pas été enregistré).
    console.error("[webhook stripe]", err);
    return json({ error: "Traitement impossible." }, 500);
  }
}
