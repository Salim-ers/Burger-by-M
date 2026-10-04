import { createMollieClient, PaymentMethod, type Payment } from "@mollie/api-client";
import { env } from "@/lib/env";
import { PaymentConfigurationError, type CaptureMode, type PaymentProvider, type ProviderPayment, type ProviderPaymentStatus } from "./provider";

/**
 * Mollie — page de paiement hébergée (carte bancaire).
 * Carte : capture MANUELLE quand le compte le permet (autorisation au paiement, encaissement quand la
 * cuisine accepte, libération si elle refuse). Le mode réel est relu sur chaque paiement Mollie :
 * si Mollie a encaissé directement, l'application le sait et rembourse en cas de refus.
 */
const toAmount = (cents: number) => ({ currency: "EUR", value: (cents / 100).toFixed(2) });
const toCents = (a?: { value: string } | null) => (a ? Math.round(Number(a.value) * 100) : 0);

export function createMollieProvider(apiKey: string): PaymentProvider {
  const mollie = createMollieClient({ apiKey });

  const map = (p: Payment): ProviderPayment => ({
    id: p.id,
    status: p.status as unknown as ProviderPaymentStatus,
    amountCents: toCents(p.amount),
    amountCapturedCents: toCents(p.amountCaptured),
    amountRefundedCents: toCents(p.amountRefunded),
    method: (p.method as string | null) ?? null,
    captureMode: ((p.captureMode as string | undefined) === "manual" ? "manual" : "automatic") as CaptureMode,
    checkoutUrl: p.getCheckoutUrl(),
    isCancelable: Boolean(p.isCancelable),
    metadataOrderId: ((p.metadata as { orderId?: string } | null)?.orderId as string | undefined) ?? null,
  });

  return {
    name: "mollie",

    async createPayment(input) {
      const p = await mollie.payments.create({
        amount: toAmount(input.amountCents),
        description: input.description,
        redirectUrl: input.redirectUrl,
        ...(input.webhookUrl ? { webhookUrl: input.webhookUrl } : {}),
        method: PaymentMethod.creditcard,
        captureMode: input.captureMode as never,
        locale: "fr_FR" as never,
        metadata: { orderId: input.orderId, orderNumber: input.orderNumber },
        ...(input.customerEmail ? { billingEmail: input.customerEmail } : {}),
        idempotencyKey: input.idempotencyKey,
      });
      const checkoutUrl = p.getCheckoutUrl();
      if (!checkoutUrl) throw new Error("Mollie : page de paiement absente");
      return { providerPaymentId: p.id, checkoutUrl, captureMode: map(p).captureMode, method: (p.method as string | null) ?? null };
    },

    async getPayment(id) {
      return map(await mollie.payments.get(id));
    },

    async capture(id, idempotencyKey) {
      await mollie.paymentCaptures.create({ paymentId: id, description: "Commande acceptée par la cuisine", idempotencyKey });
    },

    async cancel(id) {
      await mollie.payments.cancel(id);
    },

    async refund(id, amountCents, idempotencyKey) {
      const r = await mollie.paymentRefunds.create({ paymentId: id, amount: toAmount(amountCents), description: "Remboursement Burger By M", idempotencyKey });
      return { refundId: r.id, amountCents: toCents(r.amount) };
    },

    webhookPaymentId(rawBody) {
      const id = new URLSearchParams(rawBody).get("id");
      return id && /^tr_[A-Za-z0-9]{4,40}$/.test(id) ? id : null;
    },
  };
}

let cached: PaymentProvider | null = null;

/** Prestataire configuré, ou erreur explicite si la clé Mollie manque. */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const key = env().MOLLIE_API_KEY;
  if (!key) throw new PaymentConfigurationError("Paiement en ligne non configuré (clé Mollie absente).");
  cached = createMollieProvider(key);
  return cached;
}
