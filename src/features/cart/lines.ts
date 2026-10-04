import { priceLine, type PricedLine } from "@/features/menu/pricing";
import type { MenuProduct } from "@/features/menu/types";
import type { CartLine } from "./store";

/** Libellés lisibles d'une ligne : options, retraits, note. */
export function lineDetails(line: Pick<PricedLine, "modifiers" | "removedIngredients" | "note">) {
  return [
    ...line.modifiers.filter((m) => !(m.priceDeltaCents === 0 && /^seul$/i.test(m.name))).map((m) => (m.priceDeltaCents > 0 ? `+ ${m.name}` : m.name)),
    ...line.removedIngredients.map((r) => `Sans ${r.charAt(0).toLowerCase()}${r.slice(1)}`),
    ...(line.note ? [`« ${line.note} »`] : []),
  ];
}

export interface CheckedLine {
  line: CartLine;
  ok: boolean;
  unitPriceCents: number;
  lineTotalCents: number;
  details: string[];
  error: string | null;
}

/** Revalide le panier contre la carte à jour (prix et disponibilités) — affichage uniquement. */
export function checkCart(lines: CartLine[], products: Map<string, MenuProduct>): { lines: CheckedLine[]; subtotalCents: number; hasErrors: boolean } {
  const checked = lines.map((line): CheckedLine => {
    const r = priceLine(products.get(line.productId), line);
    if (r.ok) return { line, ok: true, unitPriceCents: r.line.unitPriceCents, lineTotalCents: r.line.lineTotalCents, details: lineDetails(r.line), error: null };
    const p = products.get(line.productId);
    const error = !p ? "N’est plus à la carte." : !p.isAvailable ? "Épuisé pour le moment." : p.priceCents === null ? "Non commandable en ligne." : "Personnalisation à revoir.";
    return { line, ok: false, unitPriceCents: line.unitPriceCents, lineTotalCents: line.unitPriceCents * line.quantity, details: line.details, error };
  });
  return { lines: checked, subtotalCents: checked.filter((c) => c.ok).reduce((n, c) => n + c.lineTotalCents, 0), hasErrors: checked.some((c) => !c.ok) };
}
