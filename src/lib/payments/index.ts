import "server-only";
import { getDb } from "@/db/client";
import { env, paymentsConfigured } from "@/lib/env";
import type { OrderDeps } from "@/features/orders/service";
import { getPaymentProvider } from "./mollie";
import type { PaymentProvider } from "./provider";

/** Prestataire de paiement si la clé est configurée, sinon null (paiement au retrait uniquement). */
export function paymentsOrNull(): PaymentProvider | null {
  return paymentsConfigured() ? getPaymentProvider() : null;
}

/** Dépendances du service commandes pour les routes et actions serveur. */
export function orderDeps(): OrderDeps {
  const e = env();
  return { db: getDb(), payments: paymentsOrNull(), tokenSecret: e.BETTER_AUTH_SECRET, appUrl: e.NEXT_PUBLIC_APP_URL, captureMode: e.MOLLIE_CARD_CAPTURE };
}
