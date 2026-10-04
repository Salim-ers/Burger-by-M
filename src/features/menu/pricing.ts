/**
 * Moteur de prix et de validation des personnalisations — fonctions pures, partagées :
 *  - côté client pour l'affichage immédiat (« AJOUTER — 12,70 € ») ;
 *  - côté serveur, seule source de vérité, depuis la carte relue dans Neon au moment de la commande.
 * Le prix envoyé par le navigateur n'est jamais utilisé.
 */
import type { MenuModifierGroup, MenuProduct } from "./types";

export const MAX_QUANTITY = 20;
export const MAX_ITEM_NOTE = 140;

/** Sélection d'un client pour une ligne de panier (identifiants uniquement, aucun prix). */
export interface LineSelection {
  productId: string;
  quantity: number;
  modifierIds: string[];
  removedIngredientIds: string[];
  note?: string;
}

export interface PricedModifier {
  modifierId: string;
  groupName: string;
  name: string;
  priceDeltaCents: number;
}

export interface PricedLine {
  productId: string;
  productSlug: string;
  productName: string;
  basePriceCents: number;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  modifiers: PricedModifier[];
  removedIngredients: string[];
  note: string | null;
}

export type LineError =
  | { code: "product_not_found" }
  | { code: "product_unavailable"; productName: string }
  | { code: "price_unconfirmed"; productName: string }
  | { code: "invalid_quantity" }
  | { code: "invalid_modifier" }
  | { code: "hidden_group_selected"; groupName: string }
  | { code: "too_many_choices"; groupName: string }
  | { code: "missing_required"; groupName: string }
  | { code: "invalid_ingredient" }
  | { code: "note_not_allowed" }
  | { code: "note_too_long" };

export type PriceResult = { ok: true; line: PricedLine } | { ok: false; error: LineError };

/** Un groupe est affiché si sa condition (« boisson du menu » ← « En menu ») est remplie. */
export function isGroupVisible(group: Pick<MenuModifierGroup, "visibleWhenModifierId">, selectedIds: ReadonlySet<string>) {
  return group.visibleWhenModifierId === null || selectedIds.has(group.visibleWhenModifierId);
}

/** Sélection initiale d'une fiche produit : options par défaut des groupes visibles. */
export function defaultModifierIds(product: Pick<MenuProduct, "modifierGroups">): string[] {
  const selected = new Set<string>();
  // Deux passes : un défaut peut rendre visible un autre groupe.
  for (let pass = 0; pass < 2; pass++) {
    for (const g of product.modifierGroups) {
      if (!isGroupVisible(g, selected)) continue;
      for (const m of g.modifiers) if (m.isDefault) selected.add(m.id);
    }
  }
  return [...selected];
}

/** Retire les choix des groupes devenus masqués (ex. « En menu » décoché → boisson du menu retirée). */
export function pruneHiddenSelections(product: Pick<MenuProduct, "modifierGroups">, modifierIds: string[]): string[] {
  let current = new Set(modifierIds);
  for (let pass = 0; pass < 3; pass++) {
    const next = new Set<string>();
    for (const g of product.modifierGroups) {
      if (!isGroupVisible(g, current)) continue;
      for (const m of g.modifiers) if (current.has(m.id)) next.add(m.id);
    }
    if (next.size === current.size) break;
    current = next;
  }
  return [...current];
}

/** Groupes obligatoires encore incomplets (pour l'affichage d'erreur dans la fiche). */
export function missingRequiredGroups(product: Pick<MenuProduct, "modifierGroups">, modifierIds: string[]) {
  const selected = new Set(modifierIds);
  return product.modifierGroups.filter((g) => isGroupVisible(g, selected) && g.minSelect > 0 && g.modifiers.filter((m) => selected.has(m.id)).length < g.minSelect);
}

export function normalizeNote(note: string | undefined | null) {
  const v = (note ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return v.length ? v : null;
}

/** Valide une sélection contre la carte et calcule le prix exact (centimes). */
export function priceLine(product: MenuProduct | undefined, sel: LineSelection): PriceResult {
  if (!product) return { ok: false, error: { code: "product_not_found" } };
  if (!product.isAvailable) return { ok: false, error: { code: "product_unavailable", productName: product.name } };
  if (product.priceCents === null) return { ok: false, error: { code: "price_unconfirmed", productName: product.name } };
  if (!Number.isInteger(sel.quantity) || sel.quantity < 1 || sel.quantity > MAX_QUANTITY) return { ok: false, error: { code: "invalid_quantity" } };

  const selectedIds = new Set(sel.modifierIds);
  if (selectedIds.size !== sel.modifierIds.length) return { ok: false, error: { code: "invalid_modifier" } };

  const known = new Map<string, { group: MenuModifierGroup; name: string; priceDeltaCents: number }>();
  for (const g of product.modifierGroups) for (const m of g.modifiers) known.set(m.id, { group: g, name: m.name, priceDeltaCents: m.priceDeltaCents });
  for (const id of selectedIds) if (!known.has(id)) return { ok: false, error: { code: "invalid_modifier" } };

  const modifiers: PricedModifier[] = [];
  for (const g of product.modifierGroups) {
    const chosen = g.modifiers.filter((m) => selectedIds.has(m.id));
    const visible = isGroupVisible(g, selectedIds);
    if (!visible) {
      if (chosen.length) return { ok: false, error: { code: "hidden_group_selected", groupName: g.name } };
      continue;
    }
    const max = g.selectionType === "single" ? 1 : g.maxSelect;
    if (max !== null && chosen.length > max) return { ok: false, error: { code: "too_many_choices", groupName: g.name } };
    if (chosen.length < g.minSelect) return { ok: false, error: { code: "missing_required", groupName: g.name } };
    for (const m of chosen) modifiers.push({ modifierId: m.id, groupName: g.name, name: m.name, priceDeltaCents: m.priceDeltaCents });
  }

  const removable = new Map(product.ingredients.filter((i) => i.isRemovable).map((i) => [i.id, i.name]));
  const removedIds = new Set(sel.removedIngredientIds);
  if (removedIds.size !== sel.removedIngredientIds.length) return { ok: false, error: { code: "invalid_ingredient" } };
  const removedIngredients: string[] = [];
  for (const id of removedIds) {
    const name = removable.get(id);
    if (!name) return { ok: false, error: { code: "invalid_ingredient" } };
    removedIngredients.push(name);
  }

  const note = normalizeNote(sel.note);
  if (note && !product.allowNotes) return { ok: false, error: { code: "note_not_allowed" } };
  if (note && note.length > MAX_ITEM_NOTE) return { ok: false, error: { code: "note_too_long" } };

  const unitPriceCents = product.priceCents + modifiers.reduce((n, m) => n + m.priceDeltaCents, 0);
  return {
    ok: true,
    line: {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      basePriceCents: product.priceCents,
      unitPriceCents,
      quantity: sel.quantity,
      lineTotalCents: unitPriceCents * sel.quantity,
      modifiers,
      removedIngredients,
      note,
    },
  };
}

/** Message lisible pour le client. */
export function lineErrorMessage(e: LineError): string {
  switch (e.code) {
    case "product_not_found":
      return "Un produit n’est plus à la carte.";
    case "product_unavailable":
      return `${e.productName} est indisponible pour le moment.`;
    case "price_unconfirmed":
      return `${e.productName} n’est pas encore commandable en ligne.`;
    case "invalid_quantity":
      return `Quantité invalide (1 à ${MAX_QUANTITY}).`;
    case "missing_required":
      return `Choix obligatoire : ${e.groupName.toLowerCase()}.`;
    case "too_many_choices":
      return `Trop de choix pour : ${e.groupName.toLowerCase()}.`;
    case "note_too_long":
      return `Note trop longue (${MAX_ITEM_NOTE} caractères maximum).`;
    default:
      return "La personnalisation d’un produit n’est plus valide. Modifiez-le dans le panier.";
  }
}

/** Identifiant stable d'une ligne : même produit + mêmes choix = même ligne. */
export function lineKey(sel: Omit<LineSelection, "quantity">) {
  const mods = [...sel.modifierIds].sort().join(",");
  const rem = [...sel.removedIngredientIds].sort().join(",");
  return `${sel.productId}|${mods}|${rem}|${normalizeNote(sel.note) ?? ""}`;
}
