import type { Product } from "@/types/product";
import type { SelectedOption } from "@/types/cart";

export type Selections = Record<string, string[]>;

/** Choix par défaut : uniquement les groupes dont le premier choix est neutre (ex. formule « Seul »). */
export function defaultSelections(product: Product): Selections {
  const s: Selections = {};
  for (const g of product.options) {
    if (g.id === "formule" || g.id === "quantite") s[g.id] = [g.choices[0]?.id ?? ""];
    else s[g.id] = [];
  }
  return s;
}

export function selectionsFromOptions(product: Product, options: SelectedOption[]): Selections {
  const s = defaultSelections(product);
  for (const g of product.options) {
    const picked = options.filter((o) => o.groupId === g.id).map((o) => o.choiceId);
    if (picked.length) s[g.id] = picked;
  }
  return s;
}

export function toSelectedOptions(product: Product, selections: Selections): SelectedOption[] {
  const out: SelectedOption[] = [];
  for (const g of product.options) {
    for (const id of selections[g.id] ?? []) {
      const c = g.choices.find((x) => x.id === id);
      if (c) out.push({ groupId: g.id, groupLabel: g.label, choiceId: c.id, label: c.label, priceDelta: c.priceDelta });
    }
  }
  return out;
}

/** Groupes obligatoires encore sans choix. */
export function missingGroups(product: Product, selections: Selections) {
  return product.options.filter((g) => g.required && (selections[g.id]?.length ?? 0) === 0);
}

export function canQuickAdd(product: Product) {
  return missingGroups(product, defaultSelections(product)).length === 0;
}
