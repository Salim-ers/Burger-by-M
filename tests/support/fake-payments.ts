import type { CaptureMode, PaymentProvider, ProviderPayment } from "@/lib/payments/provider";

type FakePayment = ProviderPayment & { orderId: string };

/**
 * Prestataire factice au comportement de Mollie : paiement « open », puis autorisé (capture manuelle)
 * ou payé (capture automatique) ; capture, annulation (libération) et remboursement enregistrés.
 */
export function fakePayments() {
  const store = new Map<string, FakePayment>();
  const calls = { captures: [] as string[], cancels: [] as string[], refunds: [] as { id: string; amountCents: number; key: string }[] };
  let seq = 0;
  const get = (id: string) => {
    const p = store.get(id);
    if (!p) throw Object.assign(new Error("paiement inconnu"), { statusCode: 404 });
    return p;
  };

  const provider: PaymentProvider & {
    store: typeof store;
    calls: typeof calls;
    failCreate: boolean;
    failCapture: boolean;
    /** Le compte n'autorise pas la capture manuelle : encaissement immédiat. */
    forceAutomatic: boolean;
    /** Le client valide son paiement sur la page du prestataire. */
    authorize(id: string): void;
    fail(id: string): void;
    expire(id: string): void;
    lockOpen(id: string): void;
    only(): FakePayment;
  } = {
    name: "mollie",
    store,
    calls,
    failCreate: false,
    failCapture: false,
    forceAutomatic: false,
    async createPayment(input) {
      if (provider.failCreate) throw new Error("mollie indisponible");
      const existing = [...store.values()].find((p) => p.orderId === input.orderId);
      if (existing) return { providerPaymentId: existing.id, checkoutUrl: existing.checkoutUrl!, captureMode: existing.captureMode, method: existing.method };
      const id = `tr_test${++seq}`;
      const captureMode: CaptureMode = provider.forceAutomatic ? "automatic" : input.captureMode;
      store.set(id, {
        id,
        orderId: input.orderId,
        status: "open",
        amountCents: input.amountCents,
        amountCapturedCents: 0,
        amountRefundedCents: 0,
        method: "creditcard",
        captureMode,
        checkoutUrl: `https://pay.test/${id}`,
        isCancelable: true,
        metadataOrderId: input.orderId,
      });
      return { providerPaymentId: id, checkoutUrl: `https://pay.test/${id}`, captureMode, method: "creditcard" };
    },
    async getPayment(id) {
      return { ...get(id) };
    },
    async capture(id) {
      const p = get(id);
      if (provider.failCapture || p.status !== "authorized") throw new Error("capture impossible");
      calls.captures.push(id);
      Object.assign(p, { status: "paid", amountCapturedCents: p.amountCents, isCancelable: false });
    },
    async cancel(id) {
      const p = get(id);
      if (!p.isCancelable) throw new Error("non annulable");
      calls.cancels.push(id);
      Object.assign(p, { status: "canceled", isCancelable: false, checkoutUrl: null });
    },
    async refund(id, amountCents, key) {
      const p = get(id);
      calls.refunds.push({ id, amountCents, key });
      p.amountRefundedCents += amountCents;
      return { refundId: `re_${calls.refunds.length}`, amountCents };
    },
    webhookPaymentId(rawBody) {
      const id = new URLSearchParams(rawBody).get("id");
      return id && /^tr_[A-Za-z0-9]{4,40}$/.test(id) ? id : null;
    },
    authorize(id) {
      const p = get(id);
      if (p.captureMode === "manual") Object.assign(p, { status: "authorized", isCancelable: true, checkoutUrl: null });
      else Object.assign(p, { status: "paid", amountCapturedCents: p.amountCents, isCancelable: false, checkoutUrl: null });
    },
    fail(id) {
      Object.assign(get(id), { status: "failed", isCancelable: false, checkoutUrl: null });
    },
    expire(id) {
      Object.assign(get(id), { status: "expired", isCancelable: false, checkoutUrl: null });
    },
    lockOpen(id) {
      get(id).isCancelable = false;
    },
    only() {
      const all = [...store.values()];
      if (all.length !== 1) throw new Error(`${all.length} paiements`);
      return all[0]!;
    },
  };
  return provider;
}
