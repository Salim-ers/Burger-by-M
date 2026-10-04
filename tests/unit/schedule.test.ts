import { describe, expect, it } from "vitest";
import { asapSlot, formatRanges, generateSlots, getOpeningStatus, parisParts, parisWallTimeToDate, rangesForDate, type ScheduleInput } from "@/lib/schedule";

const weekly: ScheduleInput["weekly"] = [
  { dayOfWeek: 2, opensAt: "18:00", closesAt: "22:00" },
  { dayOfWeek: 6, opensAt: "11:00", closesAt: "14:00" },
  { dayOfWeek: 6, opensAt: "18:00", closesAt: "22:30" },
];
const input: ScheduleInput = { weekly, specials: [] };
const rules = { prepMinutes: 20, intervalMinutes: 15, maxPerSlot: 2, daysAhead: 0 };

describe("fuseau Europe/Paris", () => {
  it("convertit l'heure murale de Paris en UTC, été comme hiver", () => {
    expect(parisWallTimeToDate("2026-07-04", 19 * 60).toISOString()).toBe("2026-07-04T17:00:00.000Z"); // UTC+2
    expect(parisWallTimeToDate("2026-12-05", 19 * 60).toISOString()).toBe("2026-12-05T18:00:00.000Z"); // UTC+1
  });

  it("gère le jour du changement d'heure", () => {
    // 25 octobre 2026 : passage à l'heure d'hiver à 3h.
    expect(parisWallTimeToDate("2026-10-25", 19 * 60).toISOString()).toBe("2026-10-25T18:00:00.000Z");
    expect(parisParts(new Date("2026-10-25T18:00:00Z")).minutes).toBe(19 * 60);
  });
});

describe("horaires", () => {
  it("donne les plages du jour et le statut", () => {
    // samedi 3 octobre 2026, 19:00 à Paris
    const now = parisWallTimeToDate("2026-10-03", 19 * 60);
    expect(formatRanges(rangesForDate("2026-10-03", input))).toBe("11h – 14h · 18h – 22h30");
    expect(getOpeningStatus(now, input)).toMatchObject({ isOpen: true, closesAt: "22:30" });
  });

  it("annonce la prochaine ouverture quand c'est fermé", () => {
    const sunday = parisWallTimeToDate("2026-10-04", 12 * 60);
    expect(getOpeningStatus(sunday, input)).toMatchObject({ isOpen: false, nextOpeningLabel: "mardi à 18h" });
    const saturdayAfternoon = parisWallTimeToDate("2026-10-03", 15 * 60);
    expect(getOpeningStatus(saturdayAfternoon, input).nextOpeningLabel).toBe("aujourd’hui à 18h");
  });

  it("applique les horaires exceptionnels en priorité", () => {
    const closed: ScheduleInput = { weekly, specials: [{ date: "2026-10-03", isClosed: true, opensAt: null, closesAt: null }] };
    expect(rangesForDate("2026-10-03", closed)).toEqual([]);
    const custom: ScheduleInput = { weekly, specials: [{ date: "2026-10-05", isClosed: false, opensAt: "12:00", closesAt: "15:00" }] };
    expect(formatRanges(rangesForDate("2026-10-05", custom))).toBe("12h – 15h");
  });
});

describe("créneaux de retrait", () => {
  it("commence à maintenant + préparation, aligné sur l'intervalle, jusqu'à la fermeture", () => {
    const now = parisWallTimeToDate("2026-10-03", 19 * 60 + 2); // 19:02
    const slots = generateSlots(now, input, rules, new Map());
    expect(slots[0]?.label).toBe("19:30"); // 19:02 + 20 min = 19:22 → 19:30
    expect(slots.at(-1)?.label).toBe("22:30");
  });

  it("ne propose pas de créneau avant l'ouverture + préparation", () => {
    const now = parisWallTimeToDate("2026-10-03", 16 * 60);
    const slots = generateSlots(now, input, rules, new Map());
    expect(slots[0]?.label).toBe("18:30"); // 18:00 + 20 min → 18:30
  });

  it("tient compte de la capacité par créneau", () => {
    const now = parisWallTimeToDate("2026-10-03", 19 * 60 + 2);
    const full = parisWallTimeToDate("2026-10-03", 19 * 60 + 30).toISOString();
    const slots = generateSlots(now, input, rules, new Map([[full, 2]]));
    expect(slots[0]).toMatchObject({ label: "19:30", available: false, remaining: 0 });
    expect(asapSlot(now, input, rules, new Map([[full, 2]]))?.label).toBe("19:45");
  });

  it("aucun créneau « dès que possible » quand c'est fermé", () => {
    expect(asapSlot(parisWallTimeToDate("2026-10-04", 12 * 60), input, rules, new Map())).toBeNull();
  });
});
