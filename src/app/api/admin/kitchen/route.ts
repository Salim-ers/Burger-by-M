import { getDb } from "@/db/client";
import { paymentsConfigured } from "@/lib/env";
import { paymentsOrNull } from "@/lib/payments";
import { AuthError, requireStaff } from "@/lib/auth/guard";
import { expireStalePendingOrders, kitchenOrders } from "@/features/orders/service";
import { json } from "@/lib/security/http";

export const dynamic = "force-dynamic";

let lastExpiry = 0;

/** Écran cuisine (rafraîchissement toutes les quelques secondes, en secours des notifications push). */
export async function GET() {
  try {
    await requireStaff();
  } catch (err) {
    return json({ error: (err as Error).message }, err instanceof AuthError ? err.status : 401);
  }
  const db = getDb();
  if (Date.now() - lastExpiry > 60_000) {
    lastExpiry = Date.now();
    await expireStalePendingOrders(db, paymentsOrNull()).catch((e) => console.error("[expiration]", e));
  }
  const orders = await kitchenOrders(db);
  return json({ orders, serverTime: new Date().toISOString() });
}
