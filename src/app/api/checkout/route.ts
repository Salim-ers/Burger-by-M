import { after } from "next/server";
import { getDb } from "@/db/client";
import { env, stripeConfigured } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments/stripe";
import { checkoutInputSchema, fieldErrors } from "@/features/checkout/schema";
import { CheckoutError, createOrder, expireStalePendingOrders } from "@/features/orders/service";
import { onNewKitchenOrder } from "@/features/orders/notify";
import { rateLimit } from "@/lib/security/rate-limit";
import { ipFrom, json, PayloadError, readJson, sameOrigin } from "@/lib/security/http";

export const dynamic = "force-dynamic";

/** Création d'une commande invitée. Les montants sont recalculés côté serveur depuis Neon. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origine refusée." }, 403);
  const db = getDb();
  const ip = ipFrom(req);

  let body: unknown;
  try {
    body = await readJson(req);
  } catch (err) {
    return json({ error: err instanceof PayloadError ? err.message : "Requête invalide." }, err instanceof PayloadError ? err.status : 400);
  }
  const parsed = checkoutInputSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Certaines informations sont invalides.", fields: fieldErrors(parsed.error) }, 422);

  const [byIp, byPhone] = await Promise.all([
    rateLimit(db, `checkout:ip:${ip}`, 12, 600),
    rateLimit(db, `checkout:phone:${parsed.data.customer.phone.replace(/\D/g, "")}`, 6, 600),
  ]);
  if (!byIp.ok || !byPhone.ok) return json({ error: "Trop de tentatives. Patientez quelques minutes ou appelez le restaurant." }, 429);

  const payments = stripeConfigured() ? getPaymentProvider() : null;
  try {
    const order = await createOrder({ db, payments, tokenSecret: env().BETTER_AUTH_SECRET }, parsed.data, { ip });
    if (order.status === "new" && !order.replayed) after(() => onNewKitchenOrder(db, order.orderId));
    after(() => expireStalePendingOrders(db, payments).catch((e) => console.error("[expiration]", e)));
    return json({
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
      totalCents: order.totalCents,
      paymentMethod: order.paymentMethod,
      status: order.status,
      clientSecret: order.clientSecret,
      requestedTime: order.requestedTime,
    });
  } catch (err) {
    if (err instanceof CheckoutError) return json({ error: err.message, code: err.code, lines: err.details ?? [] }, 409);
    console.error("[checkout] erreur inattendue", err);
    return json({ error: "Une erreur est survenue. Réessayez ou appelez le restaurant." }, 500);
  }
}
