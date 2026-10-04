/**
 * Abstraction du prestataire de paiement : Stripe aujourd'hui, Mollie possible demain
 * sans toucher au reste de l'application (commande, webhook, remboursement).
 */
export interface CreatePaymentInput {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  currency: "eur";
  customerEmail: string | null;
  description: string;
  /** Clé d'idempotence côté prestataire (une commande = un paiement). */
  idempotencyKey: string;
}

export interface CreatedPayment {
  providerPaymentId: string;
  /** Secret transmis au navigateur pour afficher le formulaire de paiement (Payment Element). */
  clientSecret: string;
}

export type ProviderPaymentStatus = "pending" | "succeeded" | "failed" | "canceled";

export interface ProviderPayment {
  id: string;
  status: ProviderPaymentStatus;
  amountCents: number;
  metadataOrderId: string | null;
  /** Secret client (pour reprendre un paiement interrompu). */
  clientSecret: string | null;
}

/** Événement normalisé, après vérification de signature. */
export type PaymentEvent =
  | { id: string; type: "payment.succeeded"; providerPaymentId: string; orderId: string | null; amountCents: number }
  | { id: string; type: "payment.failed"; providerPaymentId: string; orderId: string | null; error: string | null }
  | { id: string; type: "payment.canceled"; providerPaymentId: string; orderId: string | null }
  | { id: string; type: "payment.refunded"; providerPaymentId: string; amountRefundedCents: number; amountCents: number }
  | { id: string; type: "ignored"; rawType: string };

export interface RefundResult {
  refundId: string;
  amountCents: number;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatedPayment>;
  retrievePayment(providerPaymentId: string): Promise<ProviderPayment>;
  cancelPayment(providerPaymentId: string): Promise<void>;
  refund(providerPaymentId: string, amountCents: number, idempotencyKey: string): Promise<RefundResult>;
  /** Vérifie la signature et normalise l'événement. Lève une erreur si la signature est invalide. */
  parseWebhook(rawBody: string, signature: string | null): PaymentEvent;
}

export class PaymentConfigurationError extends Error {}
