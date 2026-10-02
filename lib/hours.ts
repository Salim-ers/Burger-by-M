import { DAY_NAMES, TIMEZONE, type WeekSchedule } from "@/data/opening-hours";
import { pad } from "./utils";

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function toMinutes(hhmm: string) {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

export function minutesToLabel(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Heure et jour courants à Paris, quel que soit le fuseau du visiteur. */
export function parisNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const map: Record<string, Day> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: map[get("weekday")] ?? 0, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type OpeningState =
  | { open: true; closesAt: string }
  | { open: false; opensLabel: string | null };

export function getOpeningState(schedule: WeekSchedule, date = new Date()): OpeningState {
  const { day, minutes } = parisNow(date);
  const today = schedule[day as Day];
  for (const r of today) {
    if (minutes >= toMinutes(r.open) && minutes < toMinutes(r.close)) return { open: true, closesAt: r.close };
  }
  const later = today.find((r) => toMinutes(r.open) > minutes);
  if (later) return { open: false, opensLabel: `Ouvre à ${later.open}` };
  for (let i = 1; i <= 7; i++) {
    const d = ((day + i) % 7) as Day;
    const first = schedule[d][0];
    if (first) {
      const when = i === 1 ? "demain" : DAY_NAMES[d].toLowerCase();
      return { open: false, opensLabel: `Ouvre ${when} à ${first.open}` };
    }
  }
  return { open: false, opensLabel: null };
}

export interface PickupSlot {
  /** ISO de l'heure de retrait. */
  time: string;
  label: string;
  dayLabel: string;
  available: boolean;
  remaining: number;
}

interface SlotParams {
  schedule: WeekSchedule;
  prepMinutes: number;
  intervalMinutes: number;
  maxPerSlot: number;
  /** Nombre de commandes déjà positionnées sur chaque créneau (clé = ISO). */
  load?: Record<string, number>;
  count: number;
  now?: Date;
}

/**
 * Génère les prochains créneaux de retrait.
 * Logique prévue pour la production : horaires C&C + temps de préparation + capacité par créneau.
 * En mode démo, la charge provient des commandes stockées localement.
 */
export function generatePickupSlots({ schedule, prepMinutes, intervalMinutes, maxPerSlot, load = {}, count, now = new Date() }: SlotParams): PickupSlot[] {
  const slots: PickupSlot[] = [];
  const { day, minutes } = parisNow(now);
  const earliest = minutes + prepMinutes;
  for (let offset = 0; offset < 7 && slots.length < count; offset++) {
    const d = ((day + offset) % 7) as Day;
    for (const range of schedule[d]) {
      const start = toMinutes(range.open) + Math.min(prepMinutes, 15);
      const end = toMinutes(range.close);
      let t = Math.ceil(start / intervalMinutes) * intervalMinutes;
      if (offset === 0) t = Math.max(t, Math.ceil(earliest / intervalMinutes) * intervalMinutes);
      for (; t <= end && slots.length < count; t += intervalMinutes) {
        const date = new Date(now.getTime() + (offset * 1440 + t - minutes) * 60_000);
        date.setSeconds(0, 0);
        const iso = date.toISOString();
        const used = load[slotKey(iso)] ?? 0;
        slots.push({
          time: iso,
          label: minutesToLabel(t),
          dayLabel: offset === 0 ? "Aujourd’hui" : offset === 1 ? "Demain" : DAY_NAMES[d],
          available: used < maxPerSlot,
          remaining: Math.max(0, maxPerSlot - used),
        });
      }
    }
  }
  return slots;
}

/** Clé de créneau (minute près) pour mesurer la charge. */
export function slotKey(iso: string) {
  return iso.slice(0, 16);
}

export function isOpenForAsap(schedule: WeekSchedule, prepMinutes: number, now = new Date()) {
  const state = getOpeningState(schedule, now);
  if (!state.open) return false;
  const { minutes } = parisNow(now);
  return minutes + prepMinutes <= toMinutes(state.closesAt);
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function formatDayTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, weekday: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function formatRanges(ranges: { open: string; close: string }[]) {
  if (ranges.length === 0) return "Fermé";
  return ranges.map((r) => `${r.open.replace(":", "h")} – ${r.close.replace(":", "h")}`).join(" · ");
}
