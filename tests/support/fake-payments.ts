import type { PaymentEvent, PaymentProvider, ProviderPayment } from "@/lib/payments/provider";

/** Prestataire de paiement factice pour les tests : enregistre les appels, simule Stripe. */
export function fakePayments() {
  const intents = new Map<string, ProviderPayment & { orderId: string }>();
  const refunds: { id: string; amountCents: number; key: string }[] = [];
  let seq = 0;
  const provider: PaymentProvider & { intents: typeof intents; refunds: typeof refunds; succeed(id: string): void; failCreate: boolean } = {
    name: "stripe",
    intents,
    refunds,
    failCreate: false,
    async createPayment(input) {
      if (provider.failCreate) throw new Error("stripe down");
      const existing = [...intents.values()].find((p) => p.orderId === input.orderId);
      if (existing) return { providerPaymentId: existing.id, clientSecret: `${existing.id}_secret` };
      const id = `pi_test_${++seq}`;
      intents.set(id, { id, status: "pending", amountCents: input.amountCents, metadataOrderId: input.orderId, orderId: input.orderId, clientSecret: `${id}_secret` });
      return { providerPaymentId: id, clientSecret: `${id}_secret` };
    },
    async retrievePayment(id) {
      const p = intents.get(id);
      if (!p) throw new Error("unknown intent");
      return p;
    },
    async cancelPayment(id) {
      const p = intents.get(id);
      if (p && p.status === "pending") p.status = "canceled";
    },
    async refund(id, amountCents, key) {
      refunds.push({ id, amountCents, key });
      return { refundId: `re_${refunds.length}`, amountCents };
    },
    parseWebhook(): PaymentEvent {
      throw new Error("non utilisé");
    },
    succeed(id) {
      const p = intents.get(id);
      if (p) p.status = "succeeded";
    },
  };
  return provider;
}
