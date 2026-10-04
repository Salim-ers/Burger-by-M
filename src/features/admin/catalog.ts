import "server-only";
import { asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/db/client";
import * as t from "@/db/schema";

/** Lecture de la carte pour le back-office : tout (masqué, inactif), avec les champs d'édition. */
export async function adminCatalog(db: Db) {
  const [cats, prods, images, groups, mods, links] = await Promise.all([
    db.select().from(t.categories).orderBy(asc(t.categories.sortOrder)),
    db.select().from(t.products).where(isNull(t.products.archivedAt)).orderBy(asc(t.products.sortOrder)),
    db.select().from(t.productImages).where(eq(t.productImages.isPrimary, true)),
    db.select().from(t.modifierGroups).orderBy(asc(t.modifierGroups.sortOrder), asc(t.modifierGroups.name)),
    db.select().from(t.modifiers).orderBy(asc(t.modifiers.sortOrder)),
    db.select().from(t.productModifierGroups),
  ]);
  const usage = new Map<string, number>();
  for (const l of links) usage.set(l.groupId, (usage.get(l.groupId) ?? 0) + 1);
  return {
    categories: cats.map((c) => ({
      ...c,
      products: prods.filter((p) => p.categoryId === c.id).map((p) => ({ ...p, image: images.find((i) => i.productId === p.id) ?? null })),
    })),
    groups: groups.map((g) => ({ ...g, usage: usage.get(g.id) ?? 0, modifiers: mods.filter((m) => m.groupId === g.id) })),
  };
}

export type AdminCatalog = Awaited<ReturnType<typeof adminCatalog>>;
export type AdminGroup = AdminCatalog["groups"][number];

/** Produit complet pour le formulaire d'édition. */
export async function adminProduct(db: Db, id: string) {
  const [p] = await db.select().from(t.products).where(eq(t.products.id, id)).limit(1);
  if (!p || p.archivedAt) return null;
  const [images, ingredients, links] = await Promise.all([
    db.select().from(t.productImages).where(eq(t.productImages.productId, id)).orderBy(asc(t.productImages.sortOrder)),
    db.select().from(t.productIngredients).where(eq(t.productIngredients.productId, id)).orderBy(asc(t.productIngredients.sortOrder)),
    db.select().from(t.productModifierGroups).where(eq(t.productModifierGroups.productId, id)).orderBy(asc(t.productModifierGroups.sortOrder)),
  ]);
  const image = images.find((i) => i.isPrimary) ?? images[0] ?? null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    description: p.description,
    priceCents: p.priceCents,
    isVisible: p.isVisible,
    isAvailable: p.isAvailable,
    isBestSeller: p.isBestSeller,
    isSpicy: p.isSpicy,
    isVegetarian: p.isVegetarian,
    allowNotes: p.allowNotes,
    needsFinalProductPhoto: p.needsFinalProductPhoto,
    allergens: p.allergens,
    imageSrc: image?.src ?? null,
    imageAlt: image?.alt ?? "",
    ingredients: ingredients.map((i) => ({ id: i.id, name: i.name, isRemovable: i.isRemovable })),
    groups: links.map((l) => ({ groupId: l.groupId, visibleWhenModifierId: l.visibleWhenModifierId })),
  };
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof adminProduct>>>;
