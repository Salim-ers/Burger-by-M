/**
 * Service commandes — toute la logique métier qui touche à l'argent et à la cuisine.
 * Indépendant de Next.js (testé sur une vraie base PostgreSQL PGlite).
 *
 * Règles :
 *  - les prix sont recalculés ici depuis la base ; aucun montant du navigateur n'est lu ;
 *  - le créneau est réservé atomiquement (capacité par tranche) dans la même transaction que la commande ;
 *  - le statut d'un paiement n'est jamais cru sur parole : il est relu chez le prestataire (Mollie) ;
 *  - carte : autorisation au paiement, capture quand la cuisine ACCEPTE, libération si elle REFUSE
 *    (si le prestataire a encaissé directement, le refus déclenche un remboursement) ;
 *  - toutes les transitions de paiement sont idempotentes (verrou de ligne + comparaison d'état).
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
import type { CaptureMode, PaymentProvider, ProviderPayment } from "@/lib/payments/provider";
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
  /** null : paiement en ligne indisponible (clé Mollie absente). */
  payments: PaymentProvider | null;
  /** Secret de dérivation des jetons de suivi (BETTER_AUTH_SECRET). */
  tokenSecret: string;
  /** URL publique du site : retour après paiement et webhook. */
  appUrl: string;
  /** Carte : autorisation puis capture à l'acceptation (défaut), ou encaissement immédiat. */
  captureMode?: CaptureMode;
  now?: () => Date;
}

export interface CreatedOrder {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  totalCents: number;
  paymentMethod: "card" | "on_site";
  status: OrderStatus;
  /** Paiement en ligne : page de paiement Mollie vers laquelle rediriger le client. */
  checkoutUrl: string | null;
  requestedTime: string;
  /** true si la commande existait déjà (double soumission). */
  replayed: boolean;
}

/** Jeton de suivi dérivé de la clé d'idempotence : recalculable lors d'une nouvelle soumission identique. */
export function deriveAccessToken(secret: string, idempotencyKey: string) {
  return createHmac("sha256", secret).update(`order-access:${idempotencyKey}`).digest("base64url");
}

/** Numéro lisible : « M1042 » ; l'ancien format « M-1042 » reste accepté. */
export const ORDER_NUMBER_RE = /^M-?\d{3,9}$/;

/** Méthodes de paiement proposées au client selon les réglages et la configuration. */
export function availablePaymentMethods(settings: { cardPaymentEnabled: boolean; onSitePaymentEnabled: boolean }, paymentsConfigured: boolean) {
  const methods: ("card" | "on_site")[] = [];
  if (settings.cardPaymentEnabled && paymentsConfigured) methods.push("card");
  if (settings.onSitePaymentEnabled) methods.push("on_site");
  return methods;
}

/** Webhook joignable par le prestataire uniquement sur une URL publique en https. */
export function webhookUrlFor(appUrl: string) {
  try {
    const u = new URL(appUrl);
    if (u.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(u.hostname)) return null;
    return `${u.origin}/api/webhooks/mollie`;
  } catch {
    return null;
  }
}

/** Réservations actuelles par créneau (clé ISO). */
export async function bookedSlots(db: Db, from: Date): Promise<Map<string, number>> {
  const rows = await db.select().from(t.orderSlots).where(gte(t.orderSlots.slotStart, from));
  return new Map(rows.map((r) => [r.slotStart.toISOString(), r.bookedCount]));
}

/**
 * Contexte de commande (statut, créneaux) — partagé par l'API des créneaux et la création de commande.
 * Sans temps de préparation configuré, aucune estimation n'est inventée : la commande en ligne reste fermée.
 */
export async function orderingContext(db: Db, now: Date, paymentsConfigured: boolean) {
  const [settings, schedule] = await Promise.all([loadSettings(db), loadSchedule(db, now)]);
  const prepMinutes = effectivePrepMinutes(settings);
  const status = getOpeningStatus(now, schedule);
  const methods = availablePaymentMethods(settings, paymentsConfigured);
  const rules = { prepMinutes: prepMinutes ?? 0, intervalMinutes: settings.slotIntervalMinutes, maxPerSlot: settings.maxOrdersPerSlot, daysAhead: settings.scheduleDaysAhead };
  const booked = prepMinutes === null ? new Map<string, number>() : await bookedSlots(db, startOfParisDay(now));
  const slots = prepMinutes === null ? [] : generateSlots(now, schedule, rules, booked);
  const asap = prepMinutes === null ? null : asapSlot(now, schedule, rules, booked);
  const open = settings.onlineOrderingEnabled && settings.pickupEnabled && prepMinutes !== null;
  const canOrder = open && methods.length > 0 && slots.some((s) => s.available);
  return { settings, schedule, status, slots, asap, rules, methods, canOrder, open, prepMinutes };
}

export async function createOrder(deps: OrderDeps, input: CheckoutInput, actor?: { ip?: string | null }): Promise<CreatedOrder> {
  const { db, payments, tokenSecret } = deps;
  const now = deps.now?.() ?? new Date();
  const accessToken = deriveAccessToken(tokenSecret, input.idempotencyKey);

  // Double soumission : on renvoie la commande déjà créée.
  const [previous] = await db.select().from(t.orders).where(eq(t.orders.idempotencyKey, input.idempotencyKey)).limit(1);
  if (previous) return replay(db, previous, accessToken);

  const ctx = await orderingContext(db, now, Boolean(payments));
  const { settings } = ctx;
  if (!ctx.open) throw new CheckoutError("ordering_closed", "Les commandes en ligne sont temporairement fermées.");
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
        orderNumber: `M${n}`,
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

    await tx.insert(t.payments).values({ orderId: created!.id, provider: card ? (payments?.name ?? "mollie") : "on_site", status: card ? "pending" : "on_site", amountCents: totalCents });
    return created!;
  });

  await audit(db, { userId: null, email: null, ip: actor?.ip }, "order.created", "order", order.id, { orderNumber: order.orderNumber, totalCents, paymentMethod: input.paymentMethod });

  if (!card) {
    return { orderId: order.id, orderNumber: order.orderNumber, accessToken, totalCents, paymentMethod: "on_site", status: order.orderStatus, checkoutUrl: null, requestedTime: order.requestedTime.toISOString(), replayed: false };
  }

  // Paiement en ligne créé hors transaction (pas d'appel réseau pendant un verrou).
  try {
    const p = await payments!.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountCents: totalCents,
      description: `Burger By M — commande ${order.orderNumber}`,
      redirectUrl: `${deps.appUrl.replace(/\/$/, "")}/commande/${order.orderNumber}?t=${encodeURIComponent(accessToken)}`,
      webhookUrl: webhookUrlFor(deps.appUrl),
      customerEmail: order.customerEmail,
      captureMode: deps.captureMode ?? "manual",
      idempotencyKey: `order-${order.id}`,
    });
    await db
      .update(t.payments)
      .set({ providerPaymentId: p.providerPaymentId, captureMode: p.captureMode, method: p.method, checkoutUrl: p.checkoutUrl, updatedAt: new Date() })
      .where(eq(t.payments.orderId, order.id));
    return { orderId: order.id, orderNumber: order.orderNumber, accessToken, totalCents, paymentMethod: "card", status: order.orderStatus, checkoutUrl: p.checkoutUrl, requestedTime: order.requestedTime.toISOString(), replayed: false };
  } catch (err) {
    console.error("[checkout] création du paiement impossible", err);
    await cancelUnpaidOrder(db, order.id, "payment_init_failed");
    throw new CheckoutError("payment_init_failed", "Le paiement n’a pas pu être initialisé. Réessayez dans un instant.");
  }
}

async function replay(db: Db, order: typeof t.orders.$inferSelect, accessToken: string): Promise<CreatedOrder> {
  let checkoutUrl: string | null = null;
  if (order.paymentMethod === "card" && order.orderStatus === "payment_pending") {
    const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, order.id)).limit(1);
    checkoutUrl = payment?.checkoutUrl ?? null;
  }
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    accessToken,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    status: order.orderStatus,
    checkoutUrl,
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
export async function cancelUnpaidOrder(db: Db, orderId: string, reason: string, paymentStatus: Extract<PaymentStatus, "failed" | "canceled" | "expired"> = "failed") {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(t.orders).where(eq(t.orders.id, orderId)).for("update");
    if (!order || order.orderStatus !== "payment_pending") return false;
    const now = new Date();
    await tx.update(t.orders).set({ orderStatus: "cancelled", paymentStatus, cancelledAt: now, cancelReason: reason, updatedAt: now }).where(eq(t.orders.id, orderId));
    await tx
      .update(t.payments)
      .set({ status: paymentStatus, lastError: reason, updatedAt: now })
      .where(and(eq(t.payments.orderId, orderId), eq(t.payments.status, "pending")));
    await releaseSlot(tx, order);
    return true;
  });
}

export interface PaymentEffect {
  /** La commande vient d'arriver en cuisine : notifier (push, email). */
  newKitchenOrderId: string | null;
}

export interface SyncResult extends PaymentEffect {
  known: boolean;
  orderId: string | null;
  orderStatus: OrderStatus | null;
  remote: ProviderPayment;
}

/** Une commande annulée faute de paiement repart en cuisine si le paiement aboutit malgré tout. */
const REVIVABLE_REASONS = new Set(["payment_timeout"]);

/**
 * Relit un paiement chez le prestataire et applique son état réel — webhook, retour client, expiration,
 * acceptation et refus passent tous par ici. Idempotent : rejouer la même lecture ne change rien.
 */
export async function syncPayment(db: Db, payments: PaymentProvider, providerPaymentId: string): Promise<SyncResult> {
  const remote = await payments.getPayment(providerPaymentId);
  return db.transaction(async (tx): Promise<SyncResult> => {
    const [payment] = await tx.select().from(t.payments).where(eq(t.payments.providerPaymentId, providerPaymentId)).for("update");
    if (!payment) return { known: false, orderId: null, orderStatus: null, newKitchenOrderId: null, remote };
    const [order] = await tx.select().from(t.orders).where(eq(t.orders.id, payment.orderId)).for("update");
    if (!order) return { known: false, orderId: null, orderStatus: null, newKitchenOrderId: null, remote };
    const now = new Date();

    const paymentPatch: Partial<typeof t.payments.$inferInsert> = {};
    const orderPatch: Partial<typeof t.orders.$inferInsert> = {};
    let status: PaymentStatus = payment.status;
    let toKitchen = false;
    let revived = false;

    if (remote.method && remote.method !== payment.method) paymentPatch.method = remote.method;
    if (remote.captureMode !== payment.captureMode) paymentPatch.captureMode = remote.captureMode;
    if (remote.checkoutUrl !== payment.checkoutUrl) paymentPatch.checkoutUrl = remote.checkoutUrl;

    const receivable = remote.status === "authorized" || remote.status === "paid";
    if (receivable && remote.amountCents !== order.totalCents && payment.status === "pending") {
      console.error(`[paiement] montant ${remote.amountCents} ≠ total ${order.totalCents} (${order.orderNumber})`);
      await audit(tx, null, "payment.amount_mismatch", "order", order.id, { received: remote.amountCents, expected: order.totalCents });
    }

    // Un statut local « expiré / annulé / échoué » peut venir de notre propre délai d'attente :
    // si le prestataire indique finalement une autorisation ou un paiement, c'est lui qui fait foi.
    const notReceived = payment.status === "pending" || payment.status === "failed" || payment.status === "expired" || payment.status === "canceled";
    if (remote.status === "authorized" && notReceived) {
      status = "authorized";
    } else if (remote.status === "paid" && (notReceived || payment.status === "authorized")) {
      status = "paid";
      paymentPatch.capturedAt = now;
      orderPatch.paidAt = now;
    } else if ((remote.status === "canceled" || remote.status === "expired" || remote.status === "failed") && (payment.status === "pending" || payment.status === "authorized")) {
      status = remote.status;
    }

    // Remboursements (Mollie fait foi sur le montant remboursé).
    if (remote.amountRefundedCents > payment.amountRefundedCents && (status === "paid" || status === "partially_refunded" || status === "refunded")) {
      paymentPatch.amountRefundedCents = remote.amountRefundedCents;
      status = remote.amountRefundedCents >= payment.amountCents ? "refunded" : "partially_refunded";
    }

    if (receivable && (status === "authorized" || status === "paid")) {
      if (order.orderStatus === "payment_pending") toKitchen = true;
      else if (order.orderStatus === "cancelled" && !order.refusedAt && order.cancelReason && REVIVABLE_REASONS.has(order.cancelReason)) {
        toKitchen = true;
        revived = true;
      }
    }

    if (status !== payment.status) {
      paymentPatch.status = status;
      orderPatch.paymentStatus = status;
    }
    if (toKitchen) {
      Object.assign(orderPatch, { orderStatus: "new" as const, cancelledAt: null, cancelReason: null });
      if (revived) {
        // Le créneau avait été libéré : il est à nouveau occupé (le client a payé).
        await tx
          .insert(t.orderSlots)
          .values({ slotStart: order.slotStart, bookedCount: 1 })
          .onConflictDoUpdate({ target: t.orderSlots.slotStart, set: { bookedCount: sql`${t.orderSlots.bookedCount} + 1`, updatedAt: now } });
        orderPatch.slotReleasedAt = null;
      }
    }
    // Paiement abandonné, refusé par la banque ou expiré : la commande en attente est annulée.
    const failedWhilePending = order.orderStatus === "payment_pending" && (status === "canceled" || status === "expired" || status === "failed") && !toKitchen;
    if (failedWhilePending) Object.assign(orderPatch, { orderStatus: "cancelled" as const, cancelledAt: now, cancelReason: `payment_${status}` });

    if (Object.keys(paymentPatch).length) await tx.update(t.payments).set({ ...paymentPatch, updatedAt: now }).where(eq(t.payments.id, payment.id));
    if (Object.keys(orderPatch).length) await tx.update(t.orders).set({ ...orderPatch, updatedAt: now }).where(eq(t.orders.id, order.id));
    if (failedWhilePending) await releaseSlot(tx, order);

    if (status !== payment.status) await audit(tx, null, `payment.${status}`, "order", order.id, { orderNumber: order.orderNumber, provider: payments.name });
    if (revived) await audit(tx, null, "order.revived_after_payment", "order", order.id, { orderNumber: order.orderNumber });

    const orderStatus = (orderPatch.orderStatus as OrderStatus | undefined) ?? order.orderStatus;
    return { known: true, orderId: order.id, orderStatus, newKitchenOrderId: toKitchen ? order.id : null, remote };
  });
}

/** Synchronise le paiement d'une commande (retour du client, page de suivi). */
export async function syncOrderPayment(db: Db, payments: PaymentProvider, orderId: string): Promise<PaymentEffect> {
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  if (!payment?.providerPaymentId) return { newKitchenOrderId: null };
  const r = await syncPayment(db, payments, payment.providerPaymentId);
  return { newKitchenOrderId: r.newKitchenOrderId };
}

/**
 * Le client revient modifier sa commande avant de payer : le paiement est annulé chez le prestataire,
 * puis la commande (créneau libéré). Si le paiement a abouti entre-temps, la commande part en cuisine à la place.
 */
export async function abandonPendingOrder(db: Db, payments: PaymentProvider | null, orderId: string): Promise<PaymentEffect & { result: "cancelled" | "paid" | "not_pending" }> {
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  if (payment?.providerPaymentId && payments) {
    const r = await syncPayment(db, payments, payment.providerPaymentId);
    if (r.newKitchenOrderId) return { result: "paid", newKitchenOrderId: r.newKitchenOrderId };
    if (r.orderStatus !== "payment_pending") return { result: "not_pending", newKitchenOrderId: null };
    if (r.remote.isCancelable) await payments.cancel(payment.providerPaymentId).catch((e) => console.warn("[paiement] annulation impossible", e));
  }
  const cancelled = await cancelUnpaidOrder(db, orderId, "Abandonnée par le client avant paiement", "canceled");
  return { result: cancelled ? "cancelled" : "not_pending", newKitchenOrderId: null };
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
        const r = await syncPayment(db, payments, s.pid);
        if (r.orderStatus !== "payment_pending") continue; // payé, autorisé ou déjà annulé entre-temps
        if (r.remote.isCancelable) await payments.cancel(s.pid);
      } catch (err) {
        console.error("[paiement] expiration : prestataire injoignable", err);
        continue;
      }
    }
    if (await cancelUnpaidOrder(db, s.id, "payment_timeout", "expired")) expired++;
  }
  return expired;
}

// ---------------------------------------------------------------------------
// Cuisine : acceptation, refus, avancement
// ---------------------------------------------------------------------------

/** « Nouvelles » ne sortent que par acceptation (capture) ou refus (libération / remboursement). */
export const KITCHEN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  payment_pending: [],
  new: [],
  preparing: ["ready"],
  ready: ["completed", "preparing"],
  completed: ["ready"],
  cancelled: [],
};

export class OrderActionError extends Error {
  constructor(
    public code: "not_found" | "conflict" | "forbidden" | "invalid" | "refund_failed" | "capture_failed",
    message: string,
  ) {
    super(message);
  }
}

async function conflictOrMissing(db: Db, orderId: string): Promise<never> {
  const [o] = await db.select({ s: t.orders.orderStatus }).from(t.orders).where(eq(t.orders.id, orderId)).limit(1);
  if (!o) throw new OrderActionError("not_found", "Commande introuvable.");
  throw new OrderActionError("conflict", "La commande a déjà été traitée sur un autre écran.");
}

/**
 * ACCEPTER : la commande passe en préparation (un seul écran gagne), puis le paiement autorisé est capturé.
 * Si la capture échoue (autorisation expirée…), la commande revient dans « Nouvelles » et l'erreur est affichée.
 */
export async function acceptOrder(db: Db, payments: PaymentProvider | null, orderId: string, actor: AuditActor) {
  const now = new Date();
  const [order] = await db
    .update(t.orders)
    .set({ orderStatus: "preparing", acceptedAt: now, updatedAt: now })
    .where(and(eq(t.orders.id, orderId), eq(t.orders.orderStatus, "new")))
    .returning();
  if (!order) return conflictOrMissing(db, orderId);

  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  let captured = false;
  if (payment?.status === "authorized" && payment.providerPaymentId) {
    try {
      if (!payments) throw new Error("prestataire non configuré");
      await payments.capture(payment.providerPaymentId, `capture-${payment.id}`);
      await db.update(t.payments).set({ captureRequestedAt: now, updatedAt: now }).where(eq(t.payments.id, payment.id));
      captured = true;
    } catch (err) {
      console.error("[cuisine] capture impossible", err);
      await db.update(t.orders).set({ orderStatus: "new", acceptedAt: null, updatedAt: new Date() }).where(and(eq(t.orders.id, orderId), eq(t.orders.orderStatus, "preparing")));
      await audit(db, actor, "order.capture_failed", "order", orderId, { orderNumber: order.orderNumber });
      throw new OrderActionError("capture_failed", "Encaissement impossible : l’autorisation de paiement a peut-être expiré. Refusez la commande ou appelez le client.");
    }
    // Mollie confirme l'encaissement (statut « paid ») par webhook ; relecture immédiate en complément.
    await syncPayment(db, payments!, payment.providerPaymentId).catch(() => undefined);
  }
  await audit(db, actor, "order.accepted", "order", orderId, { orderNumber: order.orderNumber, captured });
  return order;
}

export type RefusalPayment = "released" | "refunded" | "none" | "failed";

/**
 * REFUSER : la commande est annulée (créneau libéré), l'autorisation est libérée ;
 * si le paiement avait déjà été encaissé, il est remboursé intégralement.
 */
export async function refuseOrder(db: Db, payments: PaymentProvider | null, orderId: string, reason: string, actor: AuditActor) {
  const now = new Date();
  const [order] = await db
    .update(t.orders)
    .set({ orderStatus: "cancelled", refusedAt: now, cancelledAt: now, cancelReason: reason, updatedAt: now })
    .where(and(eq(t.orders.id, orderId), eq(t.orders.orderStatus, "new")))
    .returning();
  if (!order) return conflictOrMissing(db, orderId);
  await releaseSlot(db, order);

  const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
  let outcome: RefusalPayment = "none";
  if (payment?.providerPaymentId && (payment.status === "authorized" || payment.status === "paid")) {
    try {
      if (!payments) throw new Error("prestataire non configuré");
      if (payment.status === "authorized") {
        await payments.cancel(payment.providerPaymentId);
        outcome = "released";
      } else {
        const amount = payment.amountCents - payment.amountRefundedCents;
        if (amount > 0) await payments.refund(payment.providerPaymentId, amount, `refuse-${payment.id}`);
        await db.update(t.payments).set({ amountRefundedCents: payment.amountCents, status: "refunded", updatedAt: now }).where(eq(t.payments.id, payment.id));
        await db.update(t.orders).set({ paymentStatus: "refunded", updatedAt: now }).where(eq(t.orders.id, orderId));
        outcome = "refunded";
      }
      await syncPayment(db, payments, payment.providerPaymentId).catch(() => undefined);
    } catch (err) {
      console.error("[cuisine] libération / remboursement impossible", err);
      outcome = "failed";
    }
  }
  await audit(db, actor, "order.refused", "order", orderId, { orderNumber: order.orderNumber, reason, payment: outcome });
  return { order, payment: outcome };
}

export async function updateOrderStatus(db: Db, orderId: string, from: OrderStatus, to: OrderStatus, actor: AuditActor) {
  if (!KITCHEN_TRANSITIONS[from]?.includes(to)) throw new OrderActionError("invalid", "Changement de statut non autorisé.");
  const now = new Date();
  const stamp = to === "ready" ? { readyAt: now } : to === "completed" ? { completedAt: now } : {};
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
 * Annulation après acceptation (rupture, incident). Commande encaissée : remboursement intégral (gérant uniquement).
 * Avant acceptation, utiliser refuseOrder.
 */
export async function cancelOrder(db: Db, payments: PaymentProvider | null, orderId: string, reason: string, actor: AuditActor & { role: "owner" | "staff" }) {
  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, orderId)).limit(1);
  if (!order) throw new OrderActionError("not_found", "Commande introuvable.");
  if (order.orderStatus === "cancelled") return order;
  if (order.orderStatus === "new") return (await refuseOrder(db, payments, orderId, reason, actor)).order;
  if (order.orderStatus === "completed") throw new OrderActionError("invalid", "Une commande terminée ne peut plus être annulée (utilisez le remboursement).");
  if (order.orderStatus === "payment_pending") throw new OrderActionError("invalid", "Cette commande attend encore son paiement : elle s’annulera d’elle-même si le client ne paie pas.");
  const paidOnline = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";
  const authorized = order.paymentStatus === "authorized";
  if ((paidOnline || authorized) && actor.role !== "owner") throw new OrderActionError("forbidden", "Seul le gérant peut annuler une commande payée en ligne.");

  if (paidOnline) await refundOrder(db, payments, orderId, null, actor, "cancel");
  if (authorized) {
    const [payment] = await db.select().from(t.payments).where(eq(t.payments.orderId, orderId)).limit(1);
    if (payment?.providerPaymentId && payments) {
      await payments.cancel(payment.providerPaymentId).catch((e) => console.warn("[annulation] libération impossible", e));
      await syncPayment(db, payments, payment.providerPaymentId).catch(() => undefined);
    }
  }

  return db.transaction(async (tx) => {
    const [locked] = await tx.select().from(t.orders).where(eq(t.orders.id, orderId)).for("update");
    if (!locked || locked.orderStatus === "cancelled") return locked!;
    const now = new Date();
    await tx.update(t.orders).set({ orderStatus: "cancelled", cancelledAt: now, cancelReason: reason, updatedAt: now }).where(eq(t.orders.id, orderId));
    await releaseSlot(tx, locked);
    await audit(tx, actor, "order.cancelled", "order", orderId, { reason, orderNumber: locked.orderNumber });
    return { ...locked, orderStatus: "cancelled" as const };
  });
}

/** Remboursement (total si amountCents = null). Gérant uniquement. Mollie confirme ensuite le montant remboursé. */
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
  acceptedAt: string | null;
  refusedAt: string | null;
  readyAt: string | null;
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
    acceptedAt: o.acceptedAt?.toISOString() ?? null,
    refusedAt: o.refusedAt?.toISOString() ?? null,
    readyAt: o.readyAt?.toISOString() ?? null,
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
