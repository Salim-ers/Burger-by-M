/**
 * HORAIRES — source unique.
 * Relevés sur la carte imprimée (« Ouvert le Mardi : 18h-22h. Du Mercredi au Dimanche :
 * 11h-14h et 18h-22h (22h30 Vendredi et Samedi) »). Lundi : non mentionné → fermé.
 *
 * ⚠️ À FAIRE VALIDER PAR LE RESTAURANT AVANT PUBLICATION.
 * Tant que OPENING_HOURS_VALIDATED = false, les horaires ne sont PAS publiés dans le JSON-LD.
 */
export const OPENING_HOURS_VALIDATED = false;

export interface TimeRange {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

/** Index JavaScript : 0 = dimanche … 6 = samedi. */
export type WeekSchedule = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, TimeRange[]>;

export const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
/** Ordre d'affichage (semaine française). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const lunch: TimeRange = { open: "11:00", close: "14:00" };
const dinner: TimeRange = { open: "18:00", close: "22:00" };
const lateDinner: TimeRange = { open: "18:00", close: "22:30" };

export const restaurantHours: WeekSchedule = {
  0: [lunch, dinner],
  1: [],
  2: [dinner],
  3: [lunch, dinner],
  4: [lunch, dinner],
  5: [lunch, lateDinner],
  6: [lunch, lateDinner],
};

/** Horaires de prise de commande Click & Collect (identiques par défaut). */
export const clickAndCollectHours: WeekSchedule = structuredClone(restaurantHours);

export const TIMEZONE = "Europe/Paris";
