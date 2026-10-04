/**
 * Abstraction du prestataire de paiement : Mollie aujourd'hui, un autre demain
 * sans toucher au reste de l'application (commande, webhook, cuisine, remboursement).
 *
 * Le statut d'un paiement est TOUJOURS relu chez le prestataire côté serveur :
 * aucune donnée reçue du navigateur ou d'un webhook n'est crue sur parole.
 */
export type CaptureMode = "manual" | "automatic";

export interface CreatePaymentInput {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  description: string;
  /** Retour du client après paiement (page de suivi). */
  redirectUrl: string;
  /** Notification serveur à serveur ; null en local (URL non joignable par le prestataire). */
  webhookUrl: string | null;
  customerEmail: string | null;
  /** Capture souhaitée : manuelle (autorisation, encaissement à l'acceptation) si le moyen le permet. */
  captureMode: CaptureMode;
  /** Clé d'idempotence côté prestataire (une commande = un paiement). */
  idempotencyKey: string;
}

export interface CreatedPayment {
  providerPaymentId: string;
  /** Page de paiement hébergée par le prestataire. */
  checkoutUrl: string;
  captureMode: CaptureMode;
  method: string | null;
}

/** Statuts réels du prestataire (Mollie). */
export type ProviderPaymentStatus = "open" | "pending" | "authorized" | "paid" | "canceled" | "expired" | "failed";

export interface ProviderPayment {
  id: string;
  status: ProviderPaymentStatus;
  amountCents: number;
  amountCapturedCents: number;
  amountRefundedCents: number;
  method: string | null;
  captureMode: CaptureMode;
  checkoutUrl: string | null;
  /** L'autorisation ou le paiement ouvert peuvent encore être annulés. */
  isCancelable: boolean;
  metadataOrderId: string | null;
}

export interface RefundResult {
  refundId: string;
  amountCents: number;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatedPayment>;
  getPayment(providerPaymentId: string): Promise<ProviderPayment>;
  /** Encaisse un paiement autorisé (capture manuelle). */
  capture(providerPaymentId: string, idempotencyKey: string): Promise<void>;
  /** Annule un paiement ouvert ou libère une autorisation. */
  cancel(providerPaymentId: string): Promise<void>;
  refund(providerPaymentId: string, amountCents: number, idempotencyKey: string): Promise<RefundResult>;
  /** Extrait l'identifiant de paiement d'un webhook (aucune autre donnée n'est utilisée). */
  webhookPaymentId(rawBody: string): string | null;
}

export class PaymentConfigurationError extends Error {}
