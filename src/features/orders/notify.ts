import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "@/db/client";
import { orders } from "@/db/schema";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/money";
import { notifyStaff } from "@/lib/notifications/push";
import { orderConfirmationEmail, sendEmail } from "@/lib/notifications/email";
import { deriveAccessToken, getOrderByNumber } from "./service";
import { loadSettings } from "@/features/store/load";

/**
 * Nouvelle commande en cuisine (payée, ou à régler au retrait) : notification de l'équipe
 * et email de confirmation au client. Exécuté après la réponse HTTP (next/server `after`).
 */
export async function onNewKitchenOrder(db: Db, orderId: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!row) return;
  await notifyStaff(db, {
    title: "🔔 Nouvelle commande Burger By M",
    body: `Commande ${row.orderNumber} — ${formatPrice(row.totalCents)}`,
    url: "/admin/cuisine",
    tag: row.orderNumber,
  }).catch((err) => console.error("[push] envoi impossible", err));

  if (!row.customerEmail || !row.idempotencyKey) return;
  // Verrou logique : un seul email même si deux événements arrivent en même temps.
  const claimed = await db
    .update(orders)
    .set({ confirmationEmailSentAt: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders.confirmationEmailSentAt)))
    .returning({ id: orders.id });
  if (claimed.length === 0) return;

  const e = env();
  const full = await getOrderByNumber(db, row.orderNumber);
  const settings = await loadSettings(db);
  if (!full) return;
  const token = deriveAccessToken(e.BETTER_AUTH_SECRET, row.idempotencyKey);
  const url = `${e.NEXT_PUBLIC_APP_URL}/commande/${row.orderNumber}?t=${token}`;
  const ok = await sendEmail(orderConfirmationEmail(full.view, url, `${settings.name}, ${settings.street}, ${settings.postalCode} ${settings.city}`));
  if (!ok) await db.update(orders).set({ confirmationEmailSentAt: null }).where(eq(orders.id, orderId));
}
