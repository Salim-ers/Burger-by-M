/**
 * Service commandes — toute la logique métier qui touche à l'argent et à la cuisine.
 * Indépendant de Next.js (testé sur une vraie base PostgreSQL PGlite).
 *
 * Règles :
 *  - les prix sont recalculés ici depuis la base ; aucun montant du navigateur n'est lu ;
 *  - le créneau est réservé atomiquement (capacité par tranche) dans la même transaction que la commande ;
 *  - le paiement en ligne n'est validé que par le webhook signé (ou une relecture serveur chez Stripe) ;
 *  - toutes les écritures de paiement sont idempotentes.
 */
import { createHmac } from "node:crypto";
import { and, asc, desc, eq, gte, inArray, lt, or, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { loadMenu, flattenMenu } from "@/features/menu/load";
import { priceLine, lineErrorMessage, type PricedLine } from "@/features/menu/pricing";
import { effectivePrepMinutes, loadSchedule, loadSettings } from "@/features/store/load";
import type { CheckoutInput } from "@/features/checkout/schema";
import { asapSlot, generateSlots, getOpeningStatus, startOfParisDay } from "@/lib/schedule";
import type { PaymentEvent, PaymentProvider } from "@/lib/payments/provider";
import { audit, type AuditActor } from "@/lib/security/audit";
import { hashToken } from "@/lib/security/tokens";

export const PAYMENT_TIMEOUT_MINUTES = 30;

export type CheckoutErrorCode =
  | "ordering_closed"
  | "store_closed"
  | "payment_method_unavailable"
  | "cart_invalid"
  | "min_order"
  | "slot_unavailable"
  | "price_changed"
  | "payment_init_failed";

export class CheckoutError extends Error {
  constructor(
    public code: CheckoutErrorCode,
    message: string,
    public details?: { lineIndex: number; message: string }[],
  ) {
    super(message);
  }
}

export interface OrderDeps {
  db: Db;
  /** null : paiement en ligne indisponible (clés Stripe absentes). */
  payments: PaymentProvider | null;
  /** Secret de dérivation des jetons de suivi (BETTER_AUTH_SECRET). */
  tokenSecret: string;
  now?: () => Date;
}

export interface CreatedOrder {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  totalCents: number;
  paymentMethod: "card" | "on_site";
  status: OrderStatus;
  /** Présent pour un paiement en ligne : à transmettre au Payment Element. */
  clientSecret: string | null;
  requestedTime: string;
  /** true si la commande existait déjà (double soumission). */
  replayed: boolean;
}

/** Jeton de suivi dérivé de la clé d'idempotence : recalculable lors d'une nouvelle soumission identique. */
export function deriveAccessToken(secret: string, idempotencyKey: string) {
  return createHmac("sha256", secret).update(`order-access:${idempotencyKey}`).digest("base64url");
}

/** Méthodes de paiement proposées au client selon les réglages et la configuration. */
export function availablePaymentMethods(settings: { cardPaymentEnabled: boolean; onSitePaymentEnabled: boolean }, paymentsConfigured: boolean) {
  const methods: ("card" | "on_site")[] = [];
  if (settings.cardPaymentEnabled && paymentsConfigured) methods.push("card");
  if (settings.onSitePaymentEnabled) methods.push("on_site");
  return methods;
}

/** Réservations actuelles par créneau (clé ISO). */
export async function bookedSlots(db: Db, from: Date): Promise<Map<string, number>> {
  const rows = await db.select().from(t.orderSlots).where(gte(t.orderSlots.slotStart, from));
  return new Map(rows.map((r) => [r.slotStart.toISOString(), r.bookedCount]));
}

/** Contexte de commande (statut, créneaux) — partagé par l'API des créneaux et la création de commande. */
export async function orderingContext(db: Db, now: Date, paymentsConfigured: boolean) {
  const [settings, schedule] = await Promise.all([loadSettings(db), loadSchedule(db, now)]);
  const prepMinutes = effectivePrepMinutes(settings);
  const rules = { prepMinutes, intervalMinutes: settings.slotIntervalMinutes, maxPerSlot: settings.maxOrdersPerSlot, daysAhead: settings.scheduleDaysAhead };
  const booked = await bookedSlots(db, startOfParisDay(now));
  const status = getOpeningStatus(now, schedule);
  const slots = generateSlots(now, schedule, rules, booked);
  const asap = asapSlot(now, schedule, rules, booked);
  const methods = availablePaymentMethods(settings, paymentsConfigured);
  const canOrder = settings.onlineOrderingEnabled && settings.pickupEnabled && methods.length > 0 && slots.some((s) => s.available);
  return { settings, schedule, status, slots, asap, rules, methods, canOrder, prepMinutes };
}

export async function createOrder(deps: OrderDeps, input: CheckoutInput, actor?: { ip?: string | null }): Promise<CreatedOrder> {
  const { db, payments, tokenSecret } = deps;
  const now = deps.now?.() ?? new Date();
  const accessToken = deriveAccessToken(tokenSecret, input.idempotencyKey);

  // Double soumission : on renvoie la commande déjà créée.
  const [previous] = await db.select().from(t.orders).where(eq(t.orders.idempotencyKey, input.idempotencyKey)).limit(1);
  if (previous) return replay(deps, previous, accessToken);

  const ctx = await orderingContext(db, now, Boolean(payments));
  const { settings } = ctx;
  if (!settings.onlineOrderingEnabled || !settings.pickupEnabled) throw new CheckoutError("ordering_closed", "Les commandes en ligne sont momentanément indisponibles.");
  if (!ctx.methods.includes(input.paymentMethod)) throw new CheckoutError("payment_method_unavailable", "Ce moyen de paiement n’est pas disponible.");

  // Prix : relus en base, jamais transmis par le client.
  const menu = flattenMenu(await loadMenu(db));
  const priced: PricedLine[] = [];
  const errors: { lineIndex: number; message: string }[] = [];
  input.lines.forEach((sel, lineIndex) => {
    const r = priceLine(menu.get(sel.productId), sel);
    if (r.ok) priced.push(r.line);
    else errors.push({ lineIndex, message: lineErrorMessage(r.error) });
  });
  if (errors.length) throw new CheckoutError("cart_invalid", "Votre panier a changé : vérifiez les produits signalés.", errors);

  const subtotalCents = priced.reduce((n, l) => n + l.lineTotalCents, 0);
  if (subtotalCents < settings.minOrderCents) throw new CheckoutError("min_order", "Le minimum de commande n’est pas atteint.");
  const discountCents = 0;
  const deliveryFeeCents = 0;
  const totalCents = subtotalCents - discountCents + deliveryFeeCents;
  // Le total affiché au client sert uniquement de garde-fou : s'il diffère (carte modifiée entre-temps),
  // on refuse plutôt que d'encaisser un montant que le client n'a pas vu. La référence reste le calcul serveur.
  if (input.expectedTotalCents !== undefined && input.expectedTotalCents !== totalCents) {
    throw new CheckoutError("price_changed", "Les prix de la carte viennent d’être mis à jour : vérifiez votre panier avant de valider.");
  }

  // Créneau
  const wanted = input.pickup.mode === "scheduled" ? new Date(input.pickup.slotStart).toISOString() : null;
  const slot = wanted === null ? ctx.asap : ctx.slots.find((s) => s.start === wanted && s.available);
  if (!slot) {
    if (input.pickup.mode === "asap" && !ctx.status.isOpen) throw new CheckoutError("store_closed", "Le restaurant est fermé : choisissez une heure de retrait.");
    throw new CheckoutError("slot_unavailable", "Ce créneau n’est plus disponible. Choisissez-en un autre.");
  }
  const slotStart = new Date(slot.start);
  const card = input.paymentMethod === "card";

  const order = await db.transaction(async (tx) => {
    // Réservation atomique : la ligne est verrouillée, pas de surréservation possible.
    const reserved = await tx
      .insert(t.orderSlots)
      .values({ slotStart, bookedCount: 1 })
      .onConflictDoUpdate({
        target: t.orderSlots.slotStart,
        set: { bookedCount: sql`${t.orderSlots.bookedCount} + 1`, updatedAt: now },
        setWhere: sql`${t.orderSlots.bookedCount} < ${settings.maxOrdersPerSlot}`,
      })
      .returning({ count: t.orderSlots.bookedCount });
    if (reserved.length === 0) throw new CheckoutError("slot_unavailable", "Ce créneau vient d’être complété. Choisissez-en un autre.");

    const seq = (await tx.execute(sql`select nextval('order_number_seq')::int as n`)) as unknown as { rows: { n: number | string }[] };
    const n = Number(seq.rows[0]!.n);
    const [created] = await tx
      .insert(t.orders)
      .values({
        number: n,
        orderNumber: `M-${n}`,
        accessTokenHash: hashToken(accessToken),
        idempotencyKey: input.idempotencyKey,
        customerFirstName: input.customer.firstName,
        customerLastName: input.customer.lastName,
        customerPhone: input.customer.phone,
        customerEmail: input.customer.email,
        fulfillmentType: "pickup",
        requestedTime: slotStart,
        isAsap: input.pickup.mode === "asap",
        notes: settings.orderNotesEnabled ? (input.notes ?? null) || null : null,
        subtotalCents,
        discountCents,
        deliveryFeeCents,
        totalCents,
        paymentMethod: input.paymentMethod,
        paymentStatus: card ? "pending" : "on_site",
        orderStatus: card ? "payment_pending" : "new",
        slotStart,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    for (const [i, line] of priced.entries()) {
      const [item] = await tx
        .insert(t.orderItems)
        .values({
          orderId: created!.id,
          productId: line.productId,
          productName: line.productName,
          productSlug: line.productSlug,
          basePriceCents: line.basePriceCents,
          unitPriceCents: line.unitPriceCents,
          quantity: line.quantity,
          lineTotalCents: line.lineTotalCents,
          removedIngredients: line.removedIngredients,
          note: line.note,
          sortOrder: i,
        })
        .returning({ id: t.orderItems.id });
      if (line.modifiers.length) {
        await tx.insert(t.orderItemModifiers).values(
          line.modifiers.map((m) => ({ orderItemId: item!.id, modifierId: m.modifierId, groupName: m.groupName, modifierName: m.name, priceDeltaCents: m.priceDeltaCents })),
        );
      }
    }

    await tx.insert(t.payments).values({ orderId: created!.id, provider: card ? (payments?.name ?? "stripe") : "on_site", status: card ? "pending" : "on_site", amountCents: totalCents });
    return created!;
  });

  await audit(db, { userId: null, email: null, ip: actor?.ip }, "order.created", "order", order.id, { orderNumber: order.orderNumber, totalCents, paymentMethod: input.paymentMethod });

  if (!card) {
    return { orderId: order.id, orderNumber: order.orderNumber, accessToken, totalCents, paymentMethod: "on_site", status: order.orderStatus, clientSecret: null, requestedTime: order.requestedTime.toISOString(), replayed: false };
  }

  // Paiement en ligne : PaymentIntent créé hors transaction (pas d'appel réseau pendant un verrou).
  try {
    const intent = await payments!.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountCents: totalCents,
      currency: "eur",
      customerEmail: order.customerEmail,
      description: `Burger By M — commande ${order.orderNumber}`,
      idempotencyKey: `order-${order.id}`,
    });
    await db.update(t.payments).set({ providerPaymentId: intent.providerPaymentId, updatedAt: new Date() }).where(eq(t.payments.orderId, order.id));
    return { orderId: order.id, orderNumber: order.orderNumber, accessToken, totalCents, paymentMethod: "card", status: order.orderStatus, clientSecret: intent.clientSecret, requestedTime: order.requestedTime.toISOString(), replayed: false };
  } catch (err) {
    console.error("[checkout] création du paiement impossible", err);
    await cancelUnpaidOrder(db, order.id, "payment_init_failed");
    throw new CheckoutError("payment_init_failed", "Le paiement n’a pas pu être initialisé. Réessayez dans un instant.");
  }
}

async function replay(deps: OrderDeps, order: typeof t.orders.$inferSelect, accessToken: string): Promise<CreatedOrder> {
  let clientSecret: string | null = null;
  if (order.paymentMethod === "card" && order.orderStatus === "payment_pending" && deps.payments) {
    const [payment] = await deps.db.select().from(t.payments).where(eq(t.payments.orderId, order.id)).limit(1);
    if (payment?.providerPaymentId) {
      // Le secret client n'est jamais stocké : on le redemande au prestataire.
      clientSecret = (await deps.payments.retrievePayment(payment.providerPaymentId)).clientSecret;
    }
  }
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    accessToken,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    status: order.orderStatus,
    clientSecret,
    requestedTime: order.requestedTime.toISOString(),
    replayed: true,
  };
}

/** Libère la place réservée sur le créneau (une seule fois). */
async function releaseSlot(db: Db, order: Pick<typeof t.orders.$inferSelect, "id" | "slotStart" | "slotReleasedAt">) {
  if (order.slotReleasedAt) return;
  await db
    .update(t.orderSlots)
    .set({ bookedCount: sql`greatest(${t.orderSlots.bookedCount} - 1, 0)`, updatedAt: new Date() })
    .where(eq(t.orderSlots.slotStart, order.slotStart));
  await db.update(t.orders).set({ slotReleasedAt: new Date() }).where(eq(t.orders.id, order.id));
}

/** Annule une commande en attente de paiement (échec, abandon, délai dépassé). */
export async function cancelUnpaidOrder(db: Db, orderId: string, reason: string) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(t.orders).where(eq(t.orders.id, orderId)).for("update");
    if (!order || order.orderStatus !== "payment_pending") return false;
    await tx
      .update(t.orders)
      .set({ orderStatus: "cancelled", paymentStatus: "failed", cancelledAt: new Date(), cancelReason: reason, updatedAt: new Date() })
      .where(eq(t.orders.id, orderId));
    await tx.update(t.payments).set({ status: "failed", lastError: reason, updatedAt: new Date() }).where(eq(t.payments.orderId, orderId));
    await releaseSlot(tx, order);
    return true;
  });
}

export interface PaymentEffect {
  /** La commande vient d'arriver en cuisine : notifier (push, email). */
  newKitchenOrderId: string | null;
}

/**
 * Le client revient modifier sa commande avant de payer : le paiement est annulé chez le prestataire,
 * puis la commande (créneau libéré). Si le paiement a abouti entre-temps, la commande est validée à la place.
 */
export async function abandonPendingOrder(db: Db, payments: PaymentProvider | null, orderId: string): Promise<PaymentEffect & { result: "cancelled" | "paid" | "not_pending" }> {
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  if (payment?.providerPaymentId && payments) {
    const remote = await payments.retrievePayment(payment.providerPaymentId);
    if (remote.status === "succeeded") {
      const effect = await syncPaymentFromProvider(db, payments, orderId);
      return { result: "paid", ...effect };
    }
    await payments.cancelPayment(payment.providerPaymentId);
  }
  const cancelled = await cancelUnpaidOrder(db, orderId, "Abandonnée par le client avant paiement");
  return { result: cancelled ? "cancelled" : "not_pending", newKitchenOrderId: null };
}

/**
 * Applique un événement de paiement vérifié. Idempotent :
 * l'identifiant d'événement est enregistré dans la même transaction que l'effet.
 */
export async function applyPaymentEvent(db: Db, event: PaymentEvent, provider = "stripe"): Promise<PaymentEffect & { duplicate: boolean }> {
  if (event.type === "ignored") return { duplicate: false, newKitchenOrderId: null };
  return db.transaction(async (tx) => {
    const inserted = await tx.insert(t.webhookEvents).values({ id: event.id, provider, type: event.type }).onConflictDoNothing().returning({ id: t.webhookEvents.id });
    if (inserted.length === 0) return { duplicate: true, newKitchenOrderId: null };
    const effect = await applyEffect(tx, event);
    return { duplicate: false, ...effect };
  });
}

async function applyEffect(db: Db, event: Exclude<PaymentEvent, { type: "ignored" }>): Promise<PaymentEffect> {
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.providerPaymentId, event.providerPaymentId)).for("update");
  if (!payment) {
    console.warn("[paiement] événement pour un paiement inconnu", event.type, event.providerPaymentId);
    return { newKitchenOrderId: null };
  }
  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, payment.orderId)).for("update");
  if (!order) return { newKitchenOrderId: null };
  const now = new Date();

  switch (event.type) {
    case "payment.succeeded":
      return markPaid(db, order, payment, event.amountCents, now);
    case "payment.failed":
      if (payment.status === "pending" || payment.status === "failed") {
        await db.update(t.payments).set({ status: "failed", lastError: event.error, updatedAt: now }).where(eq(t.payments.id, payment.id));
        // La commande reste en attente : le client peut réessayer avec le même paiement.
      }
      return { newKitchenOrderId: null };
    case "payment.canceled":
      if (order.orderStatus === "payment_pending") await cancelUnpaidOrder(db, order.id, "payment_canceled");
      return { newKitchenOrderId: null };
    case "payment.refunded": {
      const status: PaymentStatus = event.amountRefundedCents >= event.amountCents ? "refunded" : "partially_refunded";
      await db.update(t.payments).set({ status, amountRefundedCents: event.amountRefundedCents, updatedAt: now }).where(eq(t.payments.id, payment.id));
      await db.update(t.orders).set({ paymentStatus: status, updatedAt: now }).where(eq(t.orders.id, order.id));
      return { newKitchenOrderId: null };
    }
  }
}

async function markPaid(db: Db, order: typeof t.orders.$inferSelect, payment: typeof t.payments.$inferSelect, amountCents: number, now: Date): Promise<PaymentEffect> {
  if (payment.status === "paid" || payment.status === "refunded" || payment.status === "partially_refunded") return { newKitchenOrderId: null };
  if (amountCents !== order.totalCents) {
    console.error(`[paiement] montant reçu ${amountCents} ≠ total ${order.totalCents} (${order.orderNumber})`);
    await audit(db, null, "payment.amount_mismatch", "order", order.id, { received: amountCents, expected: order.totalCents });
  }
  await db.update(t.payments).set({ status: "paid", lastError: null, updatedAt: now }).where(eq(t.payments.id, payment.id));

  let revived = false;
  if (order.orderStatus === "cancelled") {
    // Paiement arrivé après l'expiration : le client a payé, la commande repart en cuisine.
    revived = true;
    await db
      .insert(t.orderSlots)
      .values({ slotStart: order.slotStart, bookedCount: 1 })
      .onConflictDoUpdate({ target: t.orderSlots.slotStart, set: { bookedCount: sql`${t.orderSlots.bookedCount} + 1` } });
  }
  const goesToKitchen = order.orderStatus === "payment_pending" || revived;
  await db
    .update(t.orders)
    .set({
      paymentStatus: "paid",
      paidAt: now,
      updatedAt: now,
      ...(goesToKitchen ? { orderStatus: "new" as const, cancelledAt: null, cancelReason: null, slotReleasedAt: null } : {}),
    })
    .where(eq(t.orders.id, order.id));
  await audit(db, null, "order.paid", "order", order.id, { orderNumber: order.orderNumber, amountCents });
  if (revived) await audit(db, null, "order.revived_after_payment", "order", order.id, { orderNumber: order.orderNumber });
  return { newKitchenOrderId: goesToKitchen ? order.id : null };
}

/**
 * Relecture serveur du paiement chez le prestataire (retour de la page de paiement avant le webhook).
 * La source reste le prestataire, jamais le navigateur.
 */
export async function syncPaymentFromProvider(db: Db, payments: PaymentProvider, orderId: string): Promise<PaymentEffect> {
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  if (!payment?.providerPaymentId || payment.status === "paid") return { newKitchenOrderId: null };
  const remote = await payments.retrievePayment(payment.providerPaymentId);
  if (remote.status !== "succeeded") return { newKitchenOrderId: null };
  return db.transaction(async (tx) => {
    const [p] = await tx.select().from(t.payments).where(eq(t.payments.id, payment.id)).for("update");
    const [o] = await tx.select().from(t.orders).where(eq(t.orders.id, orderId)).for("update");
    if (!p || !o) return { newKitchenOrderId: null };
    return markPaid(tx, o, p, remote.amountCents, new Date());
  });
}

/** Expire les commandes impayées depuis plus de 30 minutes (annule le paiement, libère le créneau). */
export async function expireStalePendingOrders(db: Db, payments: PaymentProvider | null, now = new Date()) {
  const limit = new Date(now.getTime() - PAYMENT_TIMEOUT_MINUTES * 60_000);
  const stale = await db
    .select({ id: t.orders.id, pid: t.payments.providerPaymentId })
    .from(t.orders)
    .leftJoin(t.payments, eq(t.payments.orderId, t.orders.id))
    .where(and(eq(t.orders.orderStatus, "payment_pending"), lt(t.orders.createdAt, limit)))
    .limit(50);
  let expired = 0;
  for (const s of stale) {
    if (s.pid && payments) {
      try {
        const remote = await payments.retrievePayment(s.pid);
        if (remote.status === "succeeded") {
          await syncPaymentFromProvider(db, payments, s.id);
          continue;
        }
        await payments.cancelPayment(s.pid);
      } catch (err) {
        console.error("[paiement] expiration : prestataire injoignable", err);
        continue;
      }
    }
    if (await cancelUnpaidOrder(db, s.id, "payment_timeout")) expired++;
  }
  return expired;
}

// ---------------------------------------------------------------------------
// Cuisine : changements de statut
// ---------------------------------------------------------------------------

export const KITCHEN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  payment_pending: [],
  new: ["preparing"],
  preparing: ["ready", "new"],
  ready: ["completed", "preparing"],
  completed: ["ready"],
  cancelled: [],
};

export class OrderActionError extends Error {
  constructor(
    public code: "not_found" | "conflict" | "forbidden" | "invalid" | "refund_failed",
    message: string,
  ) {
    super(message);
  }
}

export async function updateOrderStatus(db: Db, orderId: string, from: OrderStatus, to: OrderStatus, actor: AuditActor) {
  if (!KITCHEN_TRANSITIONS[from]?.includes(to)) throw new OrderActionError("invalid", "Changement de statut non autorisé.");
  const now = new Date();
  const stamp = to === "preparing" ? { acceptedAt: now } : to === "ready" ? { readyAt: now } : to === "completed" ? { completedAt: now } : {};
  const rows = await db
    .update(t.orders)
    .set({ orderStatus: to, updatedAt: now, ...stamp })
    .where(and(eq(t.orders.id, orderId), eq(t.orders.orderStatus, from)))
    .returning({ id: t.orders.id, orderNumber: t.orders.orderNumber });
  if (rows.length === 0) throw new OrderActionError("conflict", "La commande a déjà été mise à jour sur un autre écran.");
  await audit(db, actor, "order.status", "order", orderId, { from, to, orderNumber: rows[0]!.orderNumber });
  return rows[0]!;
}

/**
 * Annulation par le restaurant. Une commande payée en ligne est remboursée intégralement (gérant uniquement).
 */
export async function cancelOrder(db: Db, payments: PaymentProvider | null, orderId: string, reason: string, actor: AuditActor & { role: "owner" | "staff" }) {
  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, orderId)).limit(1);
  if (!order) throw new OrderActionError("not_found", "Commande introuvable.");
  if (order.orderStatus === "cancelled") return order;
  if (order.orderStatus === "completed") throw new OrderActionError("invalid", "Une commande terminée ne peut plus être annulée (utilisez le remboursement).");
  const paidOnline = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";
  if (paidOnline && actor.role !== "owner") throw new OrderActionError("forbidden", "Seul le gérant peut annuler une commande payée en ligne.");

  if (paidOnline) await refundOrder(db, payments, orderId, null, actor, "cancel");

  return db.transaction(async (tx) => {
    const [locked] = await tx.select().from(t.orders).where(eq(t.orders.id, orderId)).for("update");
    if (!locked || locked.orderStatus === "cancelled") return locked!;
    const now = new Date();
    await tx
      .update(t.orders)
      .set({ orderStatus: "cancelled", cancelledAt: now, cancelReason: reason, updatedAt: now, ...(locked.paymentStatus === "pending" ? { paymentStatus: "failed" as const } : {}) })
      .where(eq(t.orders.id, orderId));
    await releaseSlot(tx, locked);
    await audit(tx, actor, "order.cancelled", "order", orderId, { reason, orderNumber: locked.orderNumber });
    return { ...locked, orderStatus: "cancelled" as const };
  });
}

/** Remboursement (total si amountCents = null). Gérant uniquement. Le webhook charge.refunded confirme le montant. */
export async function refundOrder(db: Db, payments: PaymentProvider | null, orderId: string, amountCents: number | null, actor: AuditActor & { role: "owner" | "staff" }, context = "refund") {
  if (actor.role !== "owner") throw new OrderActionError("forbidden", "Seul le gérant peut rembourser.");
  if (!payments) throw new OrderActionError("refund_failed", "Paiement en ligne non configuré.");
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  if (!payment?.providerPaymentId || (payment.status !== "paid" && payment.status !== "partially_refunded")) throw new OrderActionError("invalid", "Aucun paiement en ligne remboursable.");
  const refundable = payment.amountCents - payment.amountRefundedCents;
  const amount = amountCents ?? refundable;
  if (!Number.isInteger(amount) || amount <= 0 || amount > refundable) throw new OrderActionError("invalid", "Montant de remboursement invalide.");
  try {
    await payments.refund(payment.providerPaymentId, amount, `refund-${payment.id}-${payment.amountRefundedCents}-${amount}`);
  } catch (err) {
    console.error("[remboursement] échec", err);
    throw new OrderActionError("refund_failed", "Le remboursement a échoué chez le prestataire de paiement.");
  }
  const refunded = payment.amountRefundedCents + amount;
  const status: PaymentStatus = refunded >= payment.amountCents ? "refunded" : "partially_refunded";
  await db.update(t.payments).set({ amountRefundedCents: refunded, status, updatedAt: new Date() }).where(eq(t.payments.id, payment.id));
  await db.update(t.orders).set({ paymentStatus: status, updatedAt: new Date() }).where(eq(t.orders.id, orderId));
  await audit(db, actor, "order.refund", "order", orderId, { amountCents: amount, totalRefundedCents: refunded, context });
  return { refundedCents: refunded, status };
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

export interface OrderView {
  id: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string | null;
  requestedTime: string;
  isAsap: boolean;
  notes: string | null;
  subtotalCents: number;
  totalCents: number;
  paymentMethod: "card" | "on_site";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  updatedAt: string;
  cancelReason: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    removedIngredients: string[];
    note: string | null;
    modifiers: { groupName: string; name: string; priceDeltaCents: number }[];
  }[];
}

async function hydrate(db: Db, rows: (typeof t.orders.$inferSelect)[]): Promise<OrderView[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const items = await db.select().from(t.orderItems).where(inArray(t.orderItems.orderId, ids)).orderBy(asc(t.orderItems.sortOrder));
  const mods = items.length ? await db.select().from(t.orderItemModifiers).where(inArray(t.orderItemModifiers.orderItemId, items.map((i) => i.id))) : [];
  return rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerFirstName: o.customerFirstName,
    customerLastName: o.customerLastName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    requestedTime: o.requestedTime.toISOString(),
    isAsap: o.isAsap,
    notes: o.notes,
    subtotalCents: o.subtotalCents,
    totalCents: o.totalCents,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt?.toISOString() ?? null,
    updatedAt: o.updatedAt.toISOString(),
    cancelReason: o.cancelReason,
    items: items
      .filter((i) => i.orderId === o.id)
      .map((i) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        lineTotalCents: i.lineTotalCents,
        removedIngredients: i.removedIngredients,
        note: i.note,
        modifiers: mods.filter((m) => m.orderItemId === i.id).map((m) => ({ groupName: m.groupName, name: m.modifierName, priceDeltaCents: m.priceDeltaCents })),
      })),
  }));
}

/** Écran cuisine : commandes actives + terminées du jour. Les commandes impayées n'apparaissent jamais. */
export async function kitchenOrders(db: Db, now = new Date()) {
  const dayStart = startOfParisDay(now);
  const rows = await db
    .select()
    .from(t.orders)
    .where(
      or(
        inArray(t.orders.orderStatus, ["new", "preparing", "ready"]),
        and(eq(t.orders.orderStatus, "completed"), gte(t.orders.completedAt, dayStart)),
      ),
    )
    .orderBy(asc(t.orders.requestedTime))
    .limit(150);
  return hydrate(db, rows);
}

export type OrderFilter = "today" | "active" | "completed" | "cancelled" | "all";

export async function listOrders(db: Db, filter: OrderFilter, search: string | null, now = new Date(), limit = 100) {
  const dayStart = startOfParisDay(now);
  const conds = [];
  if (filter === "today") conds.push(gte(t.orders.createdAt, dayStart));
  if (filter === "active") conds.push(inArray(t.orders.orderStatus, ["new", "preparing", "ready"]));
  if (filter === "completed") conds.push(eq(t.orders.orderStatus, "completed"));
  if (filter === "cancelled") conds.push(eq(t.orders.orderStatus, "cancelled"));
  if (filter !== "all" && filter !== "cancelled") conds.push(sql`${t.orders.orderStatus} <> 'payment_pending'`);
  const q = search?.trim();
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    const digits = q.replace(/\D/g, "");
    conds.push(
      or(
        sql`${t.orders.orderNumber} ilike ${like}`,
        sql`(${t.orders.customerFirstName} || ' ' || ${t.orders.customerLastName}) ilike ${like}`,
        digits.length >= 4 ? sql`regexp_replace(${t.orders.customerPhone}, '\\D', '', 'g') like ${`%${digits}%`}` : undefined,
      ),
    );
  }
  const rows = await db.select().from(t.orders).where(conds.length ? and(...conds) : undefined).orderBy(desc(t.orders.createdAt)).limit(limit);
  return hydrate(db, rows);
}

export async function getOrderByNumber(db: Db, orderNumber: string) {
  const rows = await db.select().from(t.orders).where(eq(t.orders.orderNumber, orderNumber)).limit(1);
  const [view] = await hydrate(db, rows);
  return view ? { view, accessTokenHash: rows[0]!.accessTokenHash, payment: await paymentOf(db, rows[0]!.id) } : null;
}

async function paymentOf(db: Db, orderId: string) {
  const [p] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  return p ?? null;
}

/** Statistiques du jour pour le tableau de bord. */
export async function todayStats(db: Db, now = new Date()) {
  const dayStart = startOfParisDay(now);
  const rows = await db
    .select({ status: t.orders.orderStatus, n: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(${t.orders.totalCents}), 0)::int` })
    .from(t.orders)
    .where(and(gte(t.orders.createdAt, dayStart), sql`${t.orders.orderStatus} not in ('payment_pending', 'cancelled')`))
    .groupBy(t.orders.orderStatus);
  const count = (s: OrderStatus) => rows.find((r) => r.status === s)?.n ?? 0;
  return {
    orders: rows.reduce((n, r) => n + r.n, 0),
    revenueCents: rows.reduce((n, r) => n + r.total, 0),
    new: count("new"),
    preparing: count("preparing"),
    ready: count("ready"),
    completed: count("completed"),
  };
}
