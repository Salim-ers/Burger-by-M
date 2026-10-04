import { getDb } from "@/db/client";
import { stripeConfigured } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments/stripe";
import { expireStalePendingOrders, orderingContext } from "@/features/orders/service";
import { json } from "@/lib/security/http";

export const dynamic = "force-dynamic";

let lastExpiry = 0;

/** Créneaux de retrait disponibles maintenant (horaires, préparation, capacité restante). */
export async function GET() {
  try {
    const db = getDb();
    // Libère les créneaux des paiements abandonnés (au plus une fois par minute et par instance).
    if (Date.now() - lastExpiry > 60_000) {
      lastExpiry = Date.now();
      await expireStalePendingOrders(db, stripeConfigured() ? getPaymentProvider() : null).catch((e) => console.error("[expiration]", e));
    }
    const ctx = await orderingContext(db, new Date(), stripeConfigured());
    return json({
      canOrder: ctx.canOrder,
      onlineOrderingEnabled: ctx.settings.onlineOrderingEnabled,
      isOpen: ctx.status.isOpen,
      nextOpening: ctx.status.nextOpeningLabel,
      prepMinutes: ctx.prepMinutes,
      asap: ctx.asap,
      slots: ctx.slots,
      paymentMethods: ctx.methods,
      minOrderCents: ctx.settings.minOrderCents,
    });
  } catch (err) {
    console.error("[slots]", err);
    return json({ error: "Créneaux indisponibles pour le moment." }, 503);
  }
}
