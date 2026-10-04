/** Montants en centimes (entiers) : 1090 = 10,90 €. Jamais de flottants pour l'argent. */
export type Cents = number;

const formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** 1190 → « 11,90 € » (espaces insécables normalisés). */
export function formatPrice(cents: Cents) {
  return formatter.format(cents / 100).replace(/ | /g, " ");
}

/** « 11,90 » → 1190 ; null si la saisie n'est pas un prix valide (≥ 0, 2 décimales max). */
export function parsePriceInput(input: string): Cents | null {
  const v = input.trim().replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(Number(v) * 100);
}

/** 1190 → « 11,90 » (champ de saisie admin). */
export function centsToInput(cents: Cents | null | undefined) {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
