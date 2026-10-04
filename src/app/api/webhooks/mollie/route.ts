import { after } from "next/server";
import { getDb } from "@/db/client";
import { paymentsOrNull } from "@/lib/payments";
import { syncPayment } from "@/features/orders/service";
import { onNewKitchenOrder } from "@/features/orders/notify";
import { json } from "@/lib/security/http";

export const dynamic = "force-dynamic";

/**
 * Webhook Mollie. Le corps ne contient qu'un identifiant (« id=tr_… ») : le paiement est TOUJOURS relu
 * chez Mollie avec notre clé, aucune donnée reçue n'est crue. Traitement idempotent (état comparé sous verrou).
 * Réponse 200 même pour un identifiant inconnu (rien n'est révélé) ; 500 en cas d'erreur → Mollie renvoie.
 */
export async function POST(req: Request) {
  const payments = paymentsOrNull();
  if (!payments) return json({ error: "Paiement non configuré." }, 503);
  const raw = await req.text();
  if (raw.length > 2_000) return json({ error: "Trop volumineux." }, 413);
  const id = payments.webhookPaymentId(raw);
  if (!id) return json({ received: true });

  try {
    const db = getDb();
    const r = await syncPayment(db, payments, id);
    if (r.newKitchenOrderId) after(() => onNewKitchenOrder(db, r.newKitchenOrderId!));
    return json({ received: true });
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404) return json({ received: true }); // paiement inconnu de Mollie
    console.error("[webhook mollie]", err);
    return json({ error: "Traitement impossible." }, 500);
  }
}
