/**
 * Lecture de la carte depuis la base (sans cache) — utilisée par les requêtes publiques mises en cache,
 * par le back-office et par la création de commande (prix relus au moment de commander).
 */
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";
import { mediaBySrc } from "@/data/media";
import type { MenuCategory, MenuModifierGroup, MenuProduct } from "./types";

export interface LoadMenuOptions {
  /** Inclure produits masqués et catégories inactives (back-office). */
  includeHidden?: boolean;
}

export async function loadMenu(db: Db, { includeHidden = false }: LoadMenuOptions = {}): Promise<MenuCategory[]> {
  const [cats, prods, images, ingredients, links, groups, mods] = await Promise.all([
    db.select().from(t.categories).where(includeHidden ? undefined : eq(t.categories.isActive, true)).orderBy(asc(t.categories.sortOrder)),
    db
      .select()
      .from(t.products)
      .where(includeHidden ? isNull(t.products.archivedAt) : and(isNull(t.products.archivedAt), eq(t.products.isVisible, true)))
      .orderBy(asc(t.products.sortOrder)),
    db.select().from(t.productImages).orderBy(asc(t.productImages.sortOrder)),
    db.select().from(t.productIngredients).orderBy(asc(t.productIngredients.sortOrder)),
    db.select().from(t.productModifierGroups).orderBy(asc(t.productModifierGroups.sortOrder)),
    db.select().from(t.modifierGroups),
    db.select().from(t.modifiers).where(eq(t.modifiers.isActive, true)).orderBy(asc(t.modifiers.sortOrder)),
  ]);

  const groupById = new Map(groups.map((g) => [g.id, g]));
  const modsByGroup = new Map<string, typeof mods>();
  for (const m of mods) modsByGroup.set(m.groupId, [...(modsByGroup.get(m.groupId) ?? []), m]);

  const catById = new Map(cats.map((c) => [c.id, c]));
  const byCategory = new Map<string, MenuProduct[]>();

  for (const p of prods) {
    const cat = catById.get(p.categoryId);
    if (!cat) continue;
    const primary = images.find((i) => i.productId === p.id && i.isPrimary) ?? images.find((i) => i.productId === p.id);
    const known = primary ? mediaBySrc(primary.src) : null;
    const modifierGroups: MenuModifierGroup[] = links
      .filter((l) => l.productId === p.id)
      .map((l) => {
        const g = groupById.get(l.groupId)!;
        return {
          id: g.id,
          key: g.key,
          name: g.name,
          helper: g.helper,
          selectionType: g.selectionType,
          minSelect: g.minSelect,
          maxSelect: g.maxSelect,
          visibleWhenModifierId: l.visibleWhenModifierId,
          modifiers: (modsByGroup.get(g.id) ?? []).map((m) => ({ id: m.id, name: m.name, priceDeltaCents: m.priceDeltaCents, isDefault: m.isDefault })),
        };
      })
      .filter((g) => g.modifiers.length > 0);

    const product: MenuProduct = {
      id: p.id,
      slug: p.slug,
      categoryId: p.categoryId,
      categorySlug: cat.slug,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      isAvailable: p.isAvailable,
      isBestSeller: p.isBestSeller,
      isSpicy: p.isSpicy,
      isVegetarian: p.isVegetarian,
      allowNotes: p.allowNotes,
      allergens: p.allergens,
      needsFinalProductPhoto: p.needsFinalProductPhoto,
      image: primary
        ? {
            src: primary.src,
            alt: primary.alt,
            width: known?.width ?? 1200,
            height: known?.height ?? 800,
            ...(known?.position ? { position: known.position } : {}),
          }
        : null,
      ingredients: ingredients.filter((i) => i.productId === p.id).map((i) => ({ id: i.id, name: i.name, isRemovable: i.isRemovable })),
      modifierGroups,
    };
    byCategory.set(cat.id, [...(byCategory.get(cat.id) ?? []), product]);
  }

  return cats
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, title: c.title, note: c.note, products: byCategory.get(c.id) ?? [] }))
    .filter((c) => includeHidden || c.products.length > 0);
}

export function flattenMenu(menu: MenuCategory[]): Map<string, MenuProduct> {
  return new Map(menu.flatMap((c) => c.products.map((p) => [p.id, p] as const)));
}
