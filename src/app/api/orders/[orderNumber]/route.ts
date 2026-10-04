import { after } from "next/server";
import { getDb } from "@/db/client";
import { stripeConfigured } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments/stripe";
import { getOrderByNumber, syncPaymentFromProvider, PAYMENT_TIMEOUT_MINUTES } from "@/features/orders/service";
import { onNewKitchenOrder } from "@/features/orders/notify";
import { toPublicOrder } from "@/features/orders/public";
import { tokenMatches } from "@/lib/security/tokens";
import { rateLimit } from "@/lib/security/rate-limit";
import { ipFrom, json } from "@/lib/security/http";

export const dynamic = "force-dynamic";

const lastSync = new Map<string, number>();

/** Suivi client (polling) : nécessite le jeton de la commande. */
export async function GET(req: Request, ctx: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t");
  if (!/^M-\d{3,9}$/.test(orderNumber)) return json({ error: "Commande introuvable." }, 404);
  const db = getDb();
  const limited = await rateLimit(db, `track:${ipFrom(req)}`, 240, 600);
  if (!limited.ok) return json({ error: "Trop de requêtes." }, 429);

  let found = await getOrderByNumber(db, orderNumber);
  if (!found || !tokenMatches(token, found.accessTokenHash)) return json({ error: "Commande introuvable." }, 404);

  // Retour de paiement avant le webhook : relecture serveur chez Stripe (au plus toutes les 5 s).
  const age = Date.now() - new Date(found.view.createdAt).getTime();
  if (found.view.orderStatus === "payment_pending" && stripeConfigured() && age < (PAYMENT_TIMEOUT_MINUTES + 5) * 60_000) {
    const last = lastSync.get(found.view.id) ?? 0;
    if (Date.now() - last > 5_000) {
      lastSync.set(found.view.id, Date.now());
      const effect = await syncPaymentFromProvider(db, getPaymentProvider(), found.view.id).catch(() => ({ newKitchenOrderId: null }));
      if (effect.newKitchenOrderId) {
        after(() => onNewKitchenOrder(db, effect.newKitchenOrderId!));
        found = await getOrderByNumber(db, orderNumber);
      }
    }
  }
  return json(toPublicOrder(found!.view));
}
