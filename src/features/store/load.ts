/** Réglages et horaires du restaurant (lecture sans cache). */
import { asc, gte } from "drizzle-orm";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import { parisParts, type ScheduleInput } from "@/lib/schedule";

export type RestaurantSettings = typeof t.restaurantSettings.$inferSelect;

/** Valeurs de repli si la ligne de réglages n'existe pas encore (avant le premier seed). */
export const DEFAULT_SETTINGS: Omit<RestaurantSettings, "updatedAt"> = {
  id: 1,
  name: "Burger By M",
  street: "19 avenue de la Gare",
  postalCode: "60290",
  city: "Rantigny",
  phone: "03 44 24 89 18",
  email: null,
  onlineOrderingEnabled: false,
  pickupEnabled: true,
  deliveryEnabled: false,
  cardPaymentEnabled: true,
  onSitePaymentEnabled: false,
  prepMinutes: 20,
  busyMode: false,
  busyExtraMinutes: 15,
  slotIntervalMinutes: 15,
  maxOrdersPerSlot: 6,
  scheduleDaysAhead: 0,
  minOrderCents: 0,
  deliveryFeeCents: 0,
  orderNotesEnabled: true,
  googleReviewsUrl: null,
  instagramUrl: null,
  facebookUrl: null,
};

export async function loadSettings(db: Db): Promise<RestaurantSettings> {
  const [row] = await db.select().from(t.restaurantSettings).limit(1);
  return row ?? { ...DEFAULT_SETTINGS, updatedAt: new Date(0) };
}

export async function loadSchedule(db: Db, now = new Date()): Promise<ScheduleInput> {
  const from = parisParts(now).ymd;
  const [weekly, specials] = await Promise.all([
    db.select().from(t.openingHours).orderBy(asc(t.openingHours.dayOfWeek), asc(t.openingHours.opensAt)),
    db.select().from(t.specialOpeningHours).where(gte(t.specialOpeningHours.date, from)).orderBy(asc(t.specialOpeningHours.date)),
  ]);
  return {
    weekly: weekly.map((w) => ({ dayOfWeek: w.dayOfWeek, opensAt: w.opensAt, closesAt: w.closesAt })),
    specials: specials.map((s) => ({ date: s.date, isClosed: s.isClosed, opensAt: s.opensAt, closesAt: s.closesAt, note: s.note })),
  };
}

/** Temps de préparation effectif (mode « débordé » inclus). */
export function effectivePrepMinutes(s: Pick<RestaurantSettings, "prepMinutes" | "busyMode" | "busyExtraMinutes">) {
  return s.prepMinutes + (s.busyMode ? s.busyExtraMinutes : 0);
}
