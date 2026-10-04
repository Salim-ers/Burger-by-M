/**
 * Carte telle que servie au client (lecture seule, sérialisable).
 * Construite côté serveur depuis Neon par src/features/menu/load.ts.
 */
export interface MenuModifier {
  id: string;
  name: string;
  priceDeltaCents: number;
  isDefault: boolean;
}

export interface MenuModifierGroup {
  id: string;
  key: string;
  name: string;
  helper: string | null;
  selectionType: "single" | "multiple";
  minSelect: number;
  maxSelect: number | null;
  /** Groupe affiché seulement si cette option (d'un autre groupe) est choisie. */
  visibleWhenModifierId: string | null;
  modifiers: MenuModifier[];
}

export interface MenuIngredient {
  id: string;
  name: string;
  isRemovable: boolean;
}

export interface MenuImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  position?: string;
}

export interface MenuProduct {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  isAvailable: boolean;
  isBestSeller: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  allowNotes: boolean;
  allergens: string | null;
  needsFinalProductPhoto: boolean;
  image: MenuImage | null;
  ingredients: MenuIngredient[];
  modifierGroups: MenuModifierGroup[];
}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  title: string;
  note: string | null;
  products: MenuProduct[];
}

/** Commandable en ligne : visible, disponible et prix confirmé. */
export function isOrderable(p: Pick<MenuProduct, "isAvailable" | "priceCents">) {
  return p.isAvailable && p.priceCents !== null;
}

/** Composition affichée : « Double steak smash, cheddar, salade, sauce smash. » */
export function compositionText(p: Pick<MenuProduct, "ingredients" | "description">) {
  if (p.ingredients.length === 0) return p.description ?? "";
  const list = p.ingredients.map((i, idx) => (idx === 0 ? i.name : i.name.charAt(0).toLowerCase() + i.name.slice(1))).join(", ");
  return `${list}.${p.description ? ` ${p.description}` : ""}`;
}
