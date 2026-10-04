import { after } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { stripeConfigured } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments/stripe";
import { abandonPendingOrder, getOrderByNumber } from "@/features/orders/service";
import { onNewKitchenOrder } from "@/features/orders/notify";
import { tokenMatches } from "@/lib/security/tokens";
import { rateLimit } from "@/lib/security/rate-limit";
import { ipFrom, json, PayloadError, readJson, sameOrigin } from "@/lib/security/http";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ t: z.string().min(16).max(200) });

/** Le client revient modifier sa commande avant de payer : annule le paiement en attente (jeton requis). */
export async function POST(req: Request, ctx: { params: Promise<{ orderNumber: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const { orderNumber } = await ctx.params;
  if (!/^M-\d{3,9}$/.test(orderNumber)) return json({ error: "Commande introuvable." }, 404);
  const db = getDb();
  const limited = await rateLimit(db, `abandon:${ipFrom(req)}`, 20, 600);
  if (!limited.ok) return json({ error: "Trop de requêtes." }, 429);

  let body: z.infer<typeof bodySchema>;
  try {
    const parsed = bodySchema.safeParse(await readJson(req, 2_000));
    if (!parsed.success) return json({ error: "Requête invalide." }, 400);
    body = parsed.data;
  } catch (err) {
    return json({ error: err instanceof PayloadError ? err.message : "Requête invalide." }, 400);
  }

  const found = await getOrderByNumber(db, orderNumber);
  if (!found || !tokenMatches(body.t, found.accessTokenHash)) return json({ error: "Commande introuvable." }, 404);
  if (found.view.orderStatus !== "payment_pending") return json({ result: "not_pending", status: found.view.orderStatus });

  const effect = await abandonPendingOrder(db, stripeConfigured() ? getPaymentProvider() : null, found.view.id);
  if (effect.newKitchenOrderId) after(() => onNewKitchenOrder(db, effect.newKitchenOrderId!));
  return json({ result: effect.result });
}
