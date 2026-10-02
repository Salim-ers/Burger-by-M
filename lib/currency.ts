import type { Cents } from "@/types/product";

const formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Formate des centimes en euros : 1190 → « 11,90 € ». Espaces insécables normalisés. */
export function formatPrice(cents: Cents) {
  return formatter.format(cents / 100).replace(/\u202f|\u00a0/g, "\u00a0");
}

/** Somme sûre en centimes entiers. */
export function sumCents(values: Cents[]): Cents {
  return values.reduce((acc, v) => acc + Math.round(v), 0);
}

export function multiplyCents(cents: Cents, qty: number): Cents {
  return Math.round(cents) * Math.trunc(qty);
}
