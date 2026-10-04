/**
 * Horaires, statut d'ouverture et créneaux de retrait — fonctions pures (testées), heure de Paris.
 * Les horaires viennent de Neon (opening_hours + special_opening_hours) : rien n'est codé en dur.
 * Toutes les conversions passent par le fuseau Europe/Paris (changements d'heure gérés).
 */
export const TIMEZONE = "Europe/Paris";
export const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
/** Ordre d'affichage (semaine française). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export interface WeeklyRange {
  dayOfWeek: number; // 0 = dimanche
  opensAt: string; // "HH:MM"
  closesAt: string;
}

export interface SpecialDay {
  date: string; // "YYYY-MM-DD" (Paris)
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
  note?: string | null;
}

export interface TimeRange {
  opensAt: string;
  closesAt: string;
}

export interface ScheduleInput {
  weekly: WeeklyRange[];
  specials: SpecialDay[];
}

export function toMinutes(hhmm: string) {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

export function isValidHHMM(v: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
  hourCycle: "h23",
});
const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Date et heure murales à Paris pour un instant donné. */
export function parisParts(date: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  const ymd = `${p.year}-${p.month}-${p.day}`;
  return { ymd, dayOfWeek: WEEKDAYS[p.weekday as string] ?? 0, minutes: Number(p.hour) * 60 + Number(p.minute), hour: Number(p.hour), minute: Number(p.minute) };
}

/** Instant UTC correspondant à « date (Paris) + HH:MM (Paris) ». */
export function parisWallTimeToDate(ymd: string, minutesOfDay: number): Date {
  const [y, mo, d] = ymd.split("-").map(Number) as [number, number, number];
  const h = Math.floor(minutesOfDay / 60), mi = minutesOfDay % 60;
  // Première estimation : interpréter l'heure murale comme UTC, puis corriger du décalage Paris (2 passes : changements d'heure).
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 2; i++) {
    const p = parisParts(new Date(guess));
    const [py, pm, pd] = p.ymd.split("-").map(Number) as [number, number, number];
    const asUtc = Date.UTC(py, pm - 1, pd, p.hour, p.minute);
    guess += Date.UTC(y, mo - 1, d, h, mi) - asUtc;
  }
  return new Date(guess);
}

/** Ajoute n jours à une date "YYYY-MM-DD". */
export function addDays(ymd: string, n: number) {
  const [y, m, d] = ymd.split("-").map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

function dayOfWeekOf(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Plages d'ouverture d'une journée (Paris) : horaire exceptionnel prioritaire sur la semaine type. */
export function rangesForDate(ymd: string, input: ScheduleInput): TimeRange[] {
  const special = input.specials.filter((s) => s.date === ymd);
  if (special.length) {
    if (special.some((s) => s.isClosed)) return [];
    return special
      .filter((s) => s.opensAt && s.closesAt)
      .map((s) => ({ opensAt: s.opensAt as string, closesAt: s.closesAt as string }))
      .sort((a, b) => toMinutes(a.opensAt) - toMinutes(b.opensAt));
  }
  const dow = dayOfWeekOf(ymd);
  return input.weekly
    .filter((r) => r.dayOfWeek === dow)
    .map((r) => ({ opensAt: r.opensAt, closesAt: r.closesAt }))
    .sort((a, b) => toMinutes(a.opensAt) - toMinutes(b.opensAt));
}

/** « 18:00 » → « 18h », « 22:30 » → « 22h30 ». */
export function formatHour(hhmm: string) {
  const [h = "0", m = "00"] = hhmm.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}

/** « 11h – 14h · 18h – 22h » ou « Fermé ». */
export function formatRanges(ranges: TimeRange[]) {
  if (ranges.length === 0) return "Fermé";
  return ranges.map((r) => `${formatHour(r.opensAt)} – ${formatHour(r.closesAt)}`).join(" · ");
}

export interface OpeningStatus {
  isOpen: boolean;
  todayLabel: string;
  closesAt: string | null;
  /** Prochaine ouverture : « demain à 18h », « mercredi à 11h », « à 18h ». */
  nextOpeningLabel: string | null;
}

export function getOpeningStatus(now: Date, input: ScheduleInput): OpeningStatus {
  const { ymd, minutes } = parisParts(now);
  const today = rangesForDate(ymd, input);
  const current = today.find((r) => minutes >= toMinutes(r.opensAt) && minutes < toMinutes(r.closesAt));
  return {
    isOpen: Boolean(current),
    todayLabel: formatRanges(today),
    closesAt: current?.closesAt ?? null,
    nextOpeningLabel: current ? null : nextOpeningLabel(now, input),
  };
}

export function nextOpeningLabel(now: Date, input: ScheduleInput): string | null {
  const { ymd, minutes } = parisParts(now);
  const later = rangesForDate(ymd, input).find((r) => toMinutes(r.opensAt) > minutes);
  if (later) return `aujourd’hui à ${formatHour(later.opensAt)}`;
  for (let i = 1; i <= 14; i++) {
    const day = addDays(ymd, i);
    const first = rangesForDate(day, input)[0];
    if (first) {
      const when = i === 1 ? "demain" : DAY_NAMES[dayOfWeekOf(day)]!.toLowerCase();
      return `${when} à ${formatHour(first.opensAt)}`;
    }
  }
  return null;
}

export interface SlotRules {
  prepMinutes: number;
  intervalMinutes: number;
  maxPerSlot: number;
  /** 0 = aujourd'hui seulement. */
  daysAhead: number;
}

export interface PickupSlot {
  /** Instant de retrait (ISO UTC) — sert aussi de clé de capacité. */
  start: string;
  label: string; // "19:15"
  dayLabel: string; // "Aujourd’hui", "Demain", "Mercredi 8 octobre"
  remaining: number;
  available: boolean;
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, weekday: "long", day: "numeric", month: "long" });

/**
 * Créneaux de retrait : dans les plages d'ouverture, au plus tôt « maintenant + préparation »,
 * alignés sur l'intervalle, dernier créneau à l'heure de fermeture, capacité restante par créneau.
 * `booked` : nombre de commandes déjà réservées par créneau (clé = ISO du début du créneau).
 */
export function generateSlots(now: Date, input: ScheduleInput, rules: SlotRules, booked: ReadonlyMap<string, number>): PickupSlot[] {
  const { ymd } = parisParts(now);
  const earliest = now.getTime() + rules.prepMinutes * 60_000;
  const step = Math.max(5, rules.intervalMinutes);
  const out: PickupSlot[] = [];
  for (let offset = 0; offset <= rules.daysAhead; offset++) {
    const day = addDays(ymd, offset);
    const dayLabel = offset === 0 ? "Aujourd’hui" : offset === 1 ? "Demain" : capitalize(dayFormatter.format(parisWallTimeToDate(day, 720)));
    for (const r of rangesForDate(day, input)) {
      // Premier créneau : ouverture + préparation (on ne prépare pas avant l'ouverture).
      const first = toMinutes(r.opensAt) + Math.min(rules.prepMinutes, 30);
      const last = toMinutes(r.closesAt);
      for (let t = Math.ceil(first / step) * step; t <= last; t += step) {
        const at = parisWallTimeToDate(day, t);
        if (at.getTime() < earliest) continue;
        const key = at.toISOString();
        const used = booked.get(key) ?? 0;
        const remaining = Math.max(0, rules.maxPerSlot - used);
        out.push({ start: key, label: minutesLabel(t), dayLabel, remaining, available: remaining > 0 });
      }
    }
  }
  return out;
}

/**
 * Créneau « dès que possible » : premier créneau aligné ≥ maintenant + préparation, pendant une plage ouverte.
 * null si le restaurant est fermé ou ferme avant la fin de la préparation.
 */
export function asapSlot(now: Date, input: ScheduleInput, rules: SlotRules, booked: ReadonlyMap<string, number>): PickupSlot | null {
  const status = getOpeningStatus(now, input);
  if (!status.isOpen) return null;
  const today = generateSlots(now, input, { ...rules, daysAhead: 0 }, booked);
  return today.find((s) => s.available) ?? null;
}

function minutesLabel(t: number) {
  const m = ((t % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** « 19:45 » à Paris pour un instant donné. */
export function formatParisTime(d: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

/** « samedi 4 octobre à 19:45 ». */
export function formatParisDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

/** Début (UTC) de la journée de Paris contenant `now`. */
export function startOfParisDay(now: Date) {
  return parisWallTimeToDate(parisParts(now).ymd, 0);
}
