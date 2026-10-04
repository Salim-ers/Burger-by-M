"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as t from "@/db/schema";
import { clientIp, requireStaff } from "@/lib/auth/guard";
import { audit } from "@/lib/security/audit";
import { isValidHHMM, toMinutes } from "@/lib/schedule";
import { CACHE_TAGS } from "@/features/public-data";
import { DEFAULT_SETTINGS } from "@/features/store/load";
import { FR_PHONE } from "@/features/checkout/schema";
import { run, UserFacingError, type ActionResult } from "./result";

async function actor(role?: "owner") {
  const s = await requireStaff(role);
  return { ...s, ip: await clientIp() };
}

async function ensureSettingsRow() {
  await getDb().insert(t.restaurantSettings).values(DEFAULT_SETTINGS).onConflictDoNothing();
}

/** Gros interrupteur « commandes en ligne » et mode débordé : accessibles à l'équipe en service. */
export async function setOperationalAction(patch: { onlineOrderingEnabled?: boolean; busyMode?: boolean }): Promise<ActionResult> {
  return run(async () => {
    const p = z.object({ onlineOrderingEnabled: z.boolean().optional(), busyMode: z.boolean().optional() }).strict().parse(patch);
    const a = await actor();
    await ensureSettingsRow();
    const db = getDb();
    await db.update(t.restaurantSettings).set({ ...p, updatedAt: new Date() }).where(eq(t.restaurantSettings.id, 1));
    await audit(db, a, "settings.operational", "settings", "1", p);
    updateTag(CACHE_TAGS.store);
  });
}

const url = z
  .string()
  .trim()
  .max(300)
  .nullable()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https:\/\/[^\s]+$/.test(v), "Adresse web invalide (https://…).");

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  street: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Code postal invalide."),
  city: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(FR_PHONE, "Téléphone invalide."),
  email: z
    .string()
    .trim()
    .max(160)
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || z.email().safeParse(v).success, "Email invalide."),
  pickupEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
  cardPaymentEnabled: z.boolean(),
  onSitePaymentEnabled: z.boolean(),
  prepMinutes: z.number().int().min(5).max(120),
  busyExtraMinutes: z.number().int().min(0).max(120),
  slotIntervalMinutes: z.number().int().min(5).max(60),
  maxOrdersPerSlot: z.number().int().min(1).max(100),
  scheduleDaysAhead: z.number().int().min(0).max(7),
  minOrderCents: z.number().int().min(0).max(100_000),
  deliveryFeeCents: z.number().int().min(0).max(10_000),
  orderNotesEnabled: z.boolean(),
  googleReviewsUrl: url,
  instagramUrl: url,
  facebookUrl: url,
});
/** « Commandes en ligne » et « mode débordé » se règlent à part (setOperationalAction), en un geste. */
export type SettingsInput = z.input<typeof settingsSchema>;

export async function saveSettingsAction(raw: SettingsInput): Promise<ActionResult> {
  return run(async () => {
    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Données invalides.");
    if (parsed.data.deliveryEnabled) throw new UserFacingError("La livraison n’est pas encore disponible en ligne.");
    const a = await actor("owner");
    await ensureSettingsRow();
    const db = getDb();
    await db.update(t.restaurantSettings).set({ ...parsed.data, updatedAt: new Date() }).where(eq(t.restaurantSettings.id, 1));
    await audit(db, a, "settings.updated", "settings", "1", parsed.data as Record<string, unknown>);
    updateTag(CACHE_TAGS.store);
  });
}

const rangeSchema = z.object({ dayOfWeek: z.number().int().min(0).max(6), opensAt: z.string().refine(isValidHHMM), closesAt: z.string().refine(isValidHHMM) });

function checkRanges(ranges: { opensAt: string; closesAt: string }[], label: string) {
  const sorted = [...ranges].sort((x, y) => toMinutes(x.opensAt) - toMinutes(y.opensAt));
  for (const [i, r] of sorted.entries()) {
    if (toMinutes(r.opensAt) >= toMinutes(r.closesAt)) throw new UserFacingError(`${label} : l’ouverture doit précéder la fermeture.`);
    const prev = sorted[i - 1];
    if (prev && toMinutes(prev.closesAt) > toMinutes(r.opensAt)) throw new UserFacingError(`${label} : deux plages se chevauchent.`);
  }
}

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export async function saveWeeklyHoursAction(raw: z.input<typeof rangeSchema>[]): Promise<ActionResult> {
  return run(async () => {
    const ranges = z.array(rangeSchema).max(28).parse(raw);
    for (let d = 0; d < 7; d++) checkRanges(ranges.filter((r) => r.dayOfWeek === d), DAYS[d]!);
    const a = await actor("owner");
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx.delete(t.openingHours);
      if (ranges.length) await tx.insert(t.openingHours).values(ranges.map((r, i) => ({ ...r, sortOrder: i })));
    });
    await audit(db, a, "hours.updated", "opening_hours", null, { ranges });
    updateTag(CACHE_TAGS.store);
  });
}

const specialSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isClosed: z.boolean(),
    opensAt: z.string().refine(isValidHHMM).nullable(),
    closesAt: z.string().refine(isValidHHMM).nullable(),
    note: z
      .string()
      .trim()
      .max(120)
      .nullable()
      .transform((v) => (v ? v : null)),
  })
  .refine((s) => s.isClosed || (s.opensAt && s.closesAt && toMinutes(s.opensAt) < toMinutes(s.closesAt)), "Horaires exceptionnels incomplets.");

export async function addSpecialDayAction(raw: z.input<typeof specialSchema>): Promise<ActionResult> {
  return run(async () => {
    const parsed = specialSchema.safeParse(raw);
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Données invalides.");
    const s = parsed.data;
    const a = await actor("owner");
    const db = getDb();
    const [row] = await db
      .insert(t.specialOpeningHours)
      .values({ date: s.date, isClosed: s.isClosed, opensAt: s.isClosed ? null : s.opensAt, closesAt: s.isClosed ? null : s.closesAt, note: s.note })
      .returning({ id: t.specialOpeningHours.id });
    await audit(db, a, "hours.special_added", "special_opening_hours", row!.id, s);
    updateTag(CACHE_TAGS.store);
  });
}

export async function removeSpecialDayAction(id: string): Promise<ActionResult> {
  return run(async () => {
    const sid = z.uuid().parse(id);
    const a = await actor("owner");
    const db = getDb();
    await db.delete(t.specialOpeningHours).where(eq(t.specialOpeningHours.id, sid));
    await audit(db, a, "hours.special_removed", "special_opening_hours", sid);
    updateTag(CACHE_TAGS.store);
  });
}
