import { boolean, index, integer, jsonb, pgEnum, pgSequence, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { products, modifiers } from "./menu";

const ts = (name: string) => timestamp(name, { withTimezone: true });

/**
 * Statut de la commande (cuisine) — distinct du statut de paiement.
 * payment_pending : en attente du paiement en ligne (invisible en cuisine)
 * new : confirmée (payée, ou paiement au retrait), à accepter
 * preparing → ready → completed ; cancelled
 */
export const orderStatus = pgEnum("order_status", ["payment_pending", "new", "preparing", "ready", "completed", "cancelled"]);
/** on_site : à régler au retrait. */
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded", "partially_refunded", "on_site"]);
export const fulfillmentType = pgEnum("fulfillment_type", ["pickup", "delivery"]);
export const paymentMethod = pgEnum("payment_method", ["card", "on_site"]);

/** Numéros humains : M-1001, M-1002… */
export const orderNumberSeq = pgSequence("order_number_seq", { startWith: 1001 });

export type OrderStatus = (typeof orderStatus.enumValues)[number];
export type PaymentStatus = (typeof paymentStatus.enumValues)[number];
export type PaymentMethod = (typeof paymentMethod.enumValues)[number];
export type FulfillmentType = (typeof fulfillmentType.enumValues)[number];

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: integer("number").notNull().unique(),
    orderNumber: text("order_number").notNull().unique(),
    /** SHA-256 du jeton d'accès client (le suivi /commande/M-1042 exige ?t=<jeton>). */
    accessTokenHash: text("access_token_hash").notNull(),
    /** Clé fournie par le navigateur : une double soumission ne crée pas deux commandes. */
    idempotencyKey: text("idempotency_key").unique(),
    customerFirstName: text("customer_first_name").notNull(),
    customerLastName: text("customer_last_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email"),
    fulfillmentType: fulfillmentType("fulfillment_type").notNull().default("pickup"),
    /** Réservé à la livraison (non activée) : { street, postalCode, city, instructions }. */
    deliveryAddress: jsonb("delivery_address"),
    requestedTime: ts("requested_time").notNull(),
    isAsap: boolean("is_asap").notNull().default(false),
    notes: text("notes"),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("eur"),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull(),
    orderStatus: orderStatus("order_status").notNull(),
    /** Créneau réservé dans order_slots (capacité). */
    slotStart: ts("slot_start").notNull(),
    slotReleasedAt: ts("slot_released_at"),
    paidAt: ts("paid_at"),
    acceptedAt: ts("accepted_at"),
    readyAt: ts("ready_at"),
    completedAt: ts("completed_at"),
    cancelledAt: ts("cancelled_at"),
    cancelReason: text("cancel_reason"),
    confirmationEmailSentAt: ts("confirmation_email_sent_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_status_idx").on(t.orderStatus, t.requestedTime),
    index("orders_created_idx").on(t.createdAt),
    index("orders_phone_idx").on(t.customerPhone),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    /** Instantanés : la commande reste lisible même si la carte change. */
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    basePriceCents: integer("base_price_cents").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    removedIngredients: jsonb("removed_ingredients").$type<string[]>().notNull().default([]),
    note: text("note"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const orderItemModifiers = pgTable(
  "order_item_modifiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    modifierId: uuid("modifier_id").references(() => modifiers.id, { onDelete: "set null" }),
    groupName: text("group_name").notNull(),
    modifierName: text("modifier_name").notNull(),
    priceDeltaCents: integer("price_delta_cents").notNull(),
  },
  (t) => [index("order_item_modifiers_item_idx").on(t.orderItemId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    /** "stripe" | "on_site" (abstraction PaymentProvider : Mollie possible plus tard). */
    provider: text("provider").notNull(),
    /** Identifiant chez le prestataire (PaymentIntent Stripe). */
    providerPaymentId: text("provider_payment_id").unique(),
    status: paymentStatus("status").notNull(),
    amountCents: integer("amount_cents").notNull(),
    amountRefundedCents: integer("amount_refunded_cents").notNull().default(0),
    currency: text("currency").notNull().default("eur"),
    lastError: text("last_error"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [index("payments_order_idx").on(t.orderId)],
);

/** Capacité par créneau : réservation atomique (pas de surréservation en cas de commandes simultanées). */
export const orderSlots = pgTable("order_slots", {
  slotStart: ts("slot_start").primaryKey(),
  bookedCount: integer("booked_count").notNull().default(0),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

/** Événements de webhook déjà traités (idempotence : Stripe peut renvoyer le même événement). */
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  receivedAt: ts("received_at").notNull().defaultNow(),
});
