/**
 * Seed initial : carte, options, horaires et réglages.
 * Idempotent : ne touche à rien si la carte existe déjà (les modifications faites depuis l'admin sont conservées).
 */
import { sql } from "drizzle-orm";
import type { Db } from "../client";
import * as t from "../schema";
import { CATEGORIES, MODIFIER_GROUPS, OPENING_HOURS, PRODUCTS, SETTINGS, productPhoto } from "./menu-data";

export async function seedDatabase(db: Db, { log = console.log }: { log?: (m: string) => void } = {}) {
  const existing = await db.select({ n: sql<number>`count(*)::int` }).from(t.products);
  if ((existing[0]?.n ?? 0) > 0) {
    log("Carte déjà présente : seed ignoré.");
    return { seeded: false };
  }

  await db.transaction(async (tx) => {
    // Réglages (ligne unique)
    await tx.insert(t.restaurantSettings).values({ id: 1, ...SETTINGS, onSitePaymentEnabled: true, cardPaymentEnabled: true }).onConflictDoNothing();

    // Horaires
    await tx.insert(t.openingHours).values(OPENING_HOURS.map((h, i) => ({ dayOfWeek: h.day, opensAt: h.opensAt, closesAt: h.closesAt, sortOrder: i })));

    // Catégories
    const cats = await tx
      .insert(t.categories)
      .values(CATEGORIES.map((c, i) => ({ slug: c.slug, name: c.name, title: c.title, note: c.note ?? null, sortOrder: i })))
      .returning({ id: t.categories.id, slug: t.categories.slug });
    const catId = new Map(cats.map((c) => [c.slug, c.id]));

    // Groupes d'options et options
    const groupId = new Map<string, string>();
    const modifierId = new Map<string, string>(); // "groupKey/nom" → id
    for (const [gi, g] of MODIFIER_GROUPS.entries()) {
      const [row] = await tx
        .insert(t.modifierGroups)
        .values({ key: g.key, name: g.name, helper: g.helper ?? null, selectionType: g.selectionType, minSelect: g.minSelect, maxSelect: g.maxSelect, sortOrder: gi })
        .returning({ id: t.modifierGroups.id });
      groupId.set(g.key, row!.id);
      const mods = await tx
        .insert(t.modifiers)
        .values(g.modifiers.map((m, mi) => ({ groupId: row!.id, name: m.name, priceDeltaCents: m.priceDeltaCents, isDefault: m.isDefault ?? false, sortOrder: mi })))
        .returning({ id: t.modifiers.id, name: t.modifiers.name });
      for (const m of mods) modifierId.set(`${g.key}/${m.name}`, m.id);
    }

    // Produits
    const perCategory = new Map<string, number>();
    for (const p of PRODUCTS) {
      const order = perCategory.get(p.category) ?? 0;
      perCategory.set(p.category, order + 1);
      const [row] = await tx
        .insert(t.products)
        .values({
          slug: p.slug,
          categoryId: catId.get(p.category)!,
          name: p.name,
          description: p.description ?? null,
          priceCents: p.priceCents,
          isBestSeller: p.bestSeller ?? false,
          isSpicy: p.spicy ?? false,
          isVegetarian: p.vegetarian ?? false,
          allowNotes: p.allowNotes ?? false,
          needsFinalProductPhoto: p.needsFinalProductPhoto ?? false,
          sortOrder: order,
        })
        .returning({ id: t.products.id });
      const productId = row!.id;

      if (p.photo) {
        const photo = productPhoto[p.photo];
        await tx.insert(t.productImages).values({ productId, src: photo.src, alt: photo.alt, isPrimary: true });
      }
      if (p.ingredients.length) {
        await tx.insert(t.productIngredients).values(
          p.ingredients.map((ing, i) => (typeof ing === "string" ? { productId, name: ing, isRemovable: true, sortOrder: i } : { productId, name: ing.name, isRemovable: false, sortOrder: i })),
        );
      }
      if (p.groups.length) {
        await tx.insert(t.productModifierGroups).values(
          p.groups.map((g, i) => ({
            productId,
            groupId: groupId.get(g.key)!,
            sortOrder: i,
            visibleWhenModifierId: g.visibleWhen ? modifierId.get(`${g.visibleWhen.group}/${g.visibleWhen.modifier}`) ?? null : null,
          })),
        );
      }
    }
  });

  log(`Seed terminé : ${CATEGORIES.length} catégories, ${PRODUCTS.length} produits, ${MODIFIER_GROUPS.length} groupes d'options.`);
  return { seeded: true };
}
