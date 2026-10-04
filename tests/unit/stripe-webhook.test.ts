import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { createStripeProvider } from "@/lib/payments/stripe";

// Clés factices : aucun appel réseau, seule la vérification de signature est testée.
const SECRET = "whsec_test_signature_burger_by_m";
const provider = createStripeProvider("sk_test_fake_key_for_unit_tests", SECRET);
const stripe = new Stripe("sk_test_fake_key_for_unit_tests");

function signed(event: Record<string, unknown>, secret = SECRET) {
  const payload = JSON.stringify(event);
  return { payload, header: stripe.webhooks.generateTestHeaderString({ payload, secret }) };
}

const intent = (type: string, extra: Record<string, unknown> = {}) => ({
  id: `evt_${type.replace(/\W/g, "_")}`,
  object: "event",
  type,
  api_version: "2025-01-01",
  created: 1_760_000_000,
  livemode: false,
  pending_webhooks: 1,
  request: null,
  data: { object: { id: "pi_123", object: "payment_intent", amount: 1370, amount_received: 1370, metadata: { orderId: "4b1f2c3e-0000-4000-8000-000000000001", orderNumber: "M-1001" }, last_payment_error: null, ...extra } },
});

describe("webhook Stripe", () => {
  it("accepte un événement correctement signé et le normalise", () => {
    const { payload, header } = signed(intent("payment_intent.succeeded"));
    expect(provider.parseWebhook(payload, header)).toEqual({
      id: "evt_payment_intent_succeeded",
      type: "payment.succeeded",
      providerPaymentId: "pi_123",
      orderId: "4b1f2c3e-0000-4000-8000-000000000001",
      amountCents: 1370,
    });
  });

  it("refuse une signature absente, falsifiée ou faite avec un autre secret", () => {
    const { payload, header } = signed(intent("payment_intent.succeeded"));
    expect(() => provider.parseWebhook(payload, null)).toThrow();
    expect(() => provider.parseWebhook(payload, header.replace(/v1=[0-9a-f]{4}/, "v1=0000"))).toThrow();
    const other = signed(intent("payment_intent.succeeded"), "whsec_un_autre_secret");
    expect(() => provider.parseWebhook(other.payload, other.header)).toThrow();
  });

  it("refuse un corps modifié après signature (montant falsifié)", () => {
    const { payload, header } = signed(intent("payment_intent.succeeded"));
    const tampered = payload.replace('"amount_received":1370', '"amount_received":1');
    expect(() => provider.parseWebhook(tampered, header)).toThrow();
  });

  it("normalise échec, annulation, remboursement ; ignore le reste", () => {
    const failed = signed(intent("payment_intent.payment_failed", { last_payment_error: { message: "Carte refusée" } }));
    expect(provider.parseWebhook(failed.payload, failed.header)).toMatchObject({ type: "payment.failed", error: "Carte refusée" });

    const canceled = signed(intent("payment_intent.canceled"));
    expect(provider.parseWebhook(canceled.payload, canceled.header)).toMatchObject({ type: "payment.canceled", providerPaymentId: "pi_123" });

    const refunded = signed({ ...intent("charge.refunded"), data: { object: { id: "ch_1", object: "charge", payment_intent: "pi_123", amount: 1370, amount_refunded: 500 } } });
    expect(provider.parseWebhook(refunded.payload, refunded.header)).toMatchObject({ type: "payment.refunded", providerPaymentId: "pi_123", amountRefundedCents: 500, amountCents: 1370 });

    const other = signed(intent("customer.created"));
    expect(provider.parseWebhook(other.payload, other.header)).toMatchObject({ type: "ignored", rawType: "customer.created" });
  });
});
