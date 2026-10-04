import { boolean, check, customType, date, index, integer, jsonb, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

const ts = (name: string) => timestamp(name, { withTimezone: true });

/** Réglages du restaurant : une seule ligne (id = 1), tout est modifiable depuis /admin/settings. */
export const restaurantSettings = pgTable(
  "restaurant_settings",
  {
    id: integer("id").primaryKey().default(1),
    name: text("name").notNull(),
    street: text("street").notNull(),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    /** Interrupteur général : OFF = « Les commandes en ligne sont momentanément indisponibles. » */
    onlineOrderingEnabled: boolean("online_ordering_enabled").notNull().default(true),
    pickupEnabled: boolean("pickup_enabled").notNull().default(true),
    /** Structure prête ; la livraison n'est pas proposée tant que ce réglage est OFF. */
    deliveryEnabled: boolean("delivery_enabled").notNull().default(false),
    cardPaymentEnabled: boolean("card_payment_enabled").notNull().default(true),
    /** Paiement au retrait (optionnel). */
    onSitePaymentEnabled: boolean("on_site_payment_enabled").notNull().default(false),
    prepMinutes: integer("prep_minutes").notNull().default(20),
    /** « Restaurant débordé » : ajoute busyExtraMinutes au temps de préparation. */
    busyMode: boolean("busy_mode").notNull().default(false),
    busyExtraMinutes: integer("busy_extra_minutes").notNull().default(15),
    slotIntervalMinutes: integer("slot_interval_minutes").notNull().default(15),
    maxOrdersPerSlot: integer("max_orders_per_slot").notNull().default(6),
    /** 0 = commandes pour le jour même uniquement. */
    scheduleDaysAhead: integer("schedule_days_ahead").notNull().default(0),
    minOrderCents: integer("min_order_cents").notNull().default(0),
    deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
    orderNotesEnabled: boolean("order_notes_enabled").notNull().default(true),
    googleReviewsUrl: text("google_reviews_url"),
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  () => [check("restaurant_settings_singleton", sql`id = 1`)],
);

/** Horaires hebdomadaires : plusieurs plages par jour possibles. 0 = dimanche … 6 = samedi. */
export const openingHours = pgTable(
  "opening_hours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dayOfWeek: smallint("day_of_week").notNull(),
    /** "HH:MM" heure de Paris. */
    opensAt: text("opens_at").notNull(),
    closesAt: text("closes_at").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("opening_hours_day_idx").on(t.dayOfWeek)],
);

/** Horaires exceptionnels (fermeture, jour férié, horaires modifiés) — prioritaires sur la semaine type. */
export const specialOpeningHours = pgTable(
  "special_opening_hours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date", { mode: "string" }).notNull(),
    isClosed: boolean("is_closed").notNull().default(false),
    opensAt: text("opens_at"),
    closesAt: text("closes_at"),
    note: text("note"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("special_opening_hours_date_idx").on(t.date)],
);

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  failureCount: integer("failure_count").notNull().default(0),
  lastSuccessAt: ts("last_success_at"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

/** Journal des actions sensibles (statuts, remboursements, carte, réglages, connexions). */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    data: jsonb("data"),
    ipAddress: text("ip_address"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_logs_created_idx").on(t.createdAt), index("audit_logs_entity_idx").on(t.entityType, t.entityId)],
);

/** Limiteur de débit applicatif (checkout, suivi de commande…) partagé entre instances. */
export const appRateLimits = pgTable("app_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: ts("window_start").notNull(),
});

const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array }>({
  dataType: () => "bytea",
  fromDriver: (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v)),
});

/**
 * Photos téléversées depuis l'administration (produits). Ré-encodées en WebP par le serveur
 * (aucun fichier client servi tel quel), servies par /media/<id>.webp avec cache immuable.
 */
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: bytea("data").notNull(),
  contentType: text("content_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  byteSize: integer("byte_size").notNull(),
  alt: text("alt"),
  uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: ts("created_at").notNull().defaultNow(),
});
