"use server";

import sharp from "sharp";
import { updateTag } from "next/cache";
import { z } from "zod";
import { and, asc, eq, gt, inArray, isNull, lt, desc, notInArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as t from "@/db/schema";
import { clientIp, requireStaff } from "@/lib/auth/guard";
import { audit } from "@/lib/security/audit";
import { CACHE_TAGS } from "@/features/public-data";
import { run, UserFacingError, type ActionResult } from "./result";

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imageSrcRe = /^\/(images\/[a-z0-9/_-]+\.(webp|png|jpg)|media\/[0-9a-f-]{36}\.webp)$/;
const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((v) => (v ? v : null));

async function actor(role?: "owner") {
  const s = await requireStaff(role);
  return { ...s, ip: await clientIp() };
}

function invalidate() {
  updateTag(CACHE_TAGS.menu);
}

/** « Épuisé / Disponible » : accessible à toute l'équipe, effet immédiat sur la carte. */
export async function setProductAvailabilityAction(productId: string, available: boolean): Promise<ActionResult> {
  return run(async () => {
    const id = z.uuid().parse(productId);
    const a = await actor();
    const db = getDb();
    const [p] = await db.update(t.products).set({ isAvailable: available, updatedAt: new Date() }).where(eq(t.products.id, id)).returning({ name: t.products.name });
    if (!p) throw new UserFacingError("Produit introuvable.");
    await audit(db, a, available ? "product.available" : "product.unavailable", "product", id, { name: p.name });
    invalidate();
  });
}

const productSchema = z.object({
  id: z.uuid().optional(),
  name: text(80).min(2, "Nom trop court."),
  slug: z.string().trim().toLowerCase().max(80).regex(slugRe, "Identifiant d’URL : lettres minuscules, chiffres et tirets."),
  categoryId: z.uuid(),
  description: optionalText(400),
  priceCents: z.number().int().min(0).max(100_000).nullable(),
  isVisible: z.boolean(),
  isAvailable: z.boolean(),
  isBestSeller: z.boolean(),
  isSpicy: z.boolean(),
  isVegetarian: z.boolean(),
  allowNotes: z.boolean(),
  needsFinalProductPhoto: z.boolean(),
  allergens: optionalText(400),
  imageSrc: z.string().regex(imageSrcRe).nullable(),
  imageAlt: text(200),
  ingredients: z.array(z.object({ id: z.uuid().optional(), name: text(80).min(1), isRemovable: z.boolean() })).max(20),
  groups: z.array(z.object({ groupId: z.uuid(), visibleWhenModifierId: z.uuid().nullable() })).max(10),
});
export type ProductInput = z.input<typeof productSchema>;

export async function saveProductAction(raw: ProductInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Données invalides.");
    const p = parsed.data;
    const a = await actor("owner");
    const db = getDb();
    const id = await db.transaction(async (tx) => {
      const [dupe] = await tx.select({ id: t.products.id }).from(t.products).where(eq(t.products.slug, p.slug)).limit(1);
      if (dupe && dupe.id !== p.id) throw new UserFacingError("Cet identifiant d’URL est déjà utilisé.");
      const values = {
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
        updatedAt: new Date(),
      };
      let productId = p.id;
      if (productId) {
        const updated = await tx.update(t.products).set(values).where(eq(t.products.id, productId)).returning({ id: t.products.id });
        if (!updated.length) throw new UserFacingError("Produit introuvable.");
      } else {
        const [last] = await tx.select({ o: t.products.sortOrder }).from(t.products).where(eq(t.products.categoryId, p.categoryId)).orderBy(desc(t.products.sortOrder)).limit(1);
        const [created] = await tx.insert(t.products).values({ ...values, sortOrder: (last?.o ?? -1) + 1 }).returning({ id: t.products.id });
        productId = created!.id;
      }

      // Photo principale
      await tx.delete(t.productImages).where(eq(t.productImages.productId, productId));
      if (p.imageSrc) await tx.insert(t.productImages).values({ productId, src: p.imageSrc, alt: p.imageAlt || p.name, isPrimary: true });

      // Ingrédients : mise à jour en place (les paniers en cours gardent des identifiants valides).
      const keep = p.ingredients.filter((i) => i.id).map((i) => i.id!);
      await tx.delete(t.productIngredients).where(keep.length ? and(eq(t.productIngredients.productId, productId), notInArray(t.productIngredients.id, keep)) : eq(t.productIngredients.productId, productId));
      for (const [i, ing] of p.ingredients.entries()) {
        if (ing.id) await tx.update(t.productIngredients).set({ name: ing.name, isRemovable: ing.isRemovable, sortOrder: i }).where(and(eq(t.productIngredients.id, ing.id), eq(t.productIngredients.productId, productId)));
        else await tx.insert(t.productIngredients).values({ productId, name: ing.name, isRemovable: ing.isRemovable, sortOrder: i });
      }

      // Groupes d'options proposés
      await tx.delete(t.productModifierGroups).where(eq(t.productModifierGroups.productId, productId));
      const unique = p.groups.filter((g, i, arr) => arr.findIndex((x) => x.groupId === g.groupId) === i);
      if (unique.length) await tx.insert(t.productModifierGroups).values(unique.map((g, i) => ({ productId: productId!, groupId: g.groupId, visibleWhenModifierId: g.visibleWhenModifierId, sortOrder: i })));
      return productId;
    });
    await audit(db, a, p.id ? "product.updated" : "product.created", "product", id, { name: p.name, priceCents: p.priceCents });
    invalidate();
    return { id };
  });
}

export async function archiveProductAction(productId: string): Promise<ActionResult> {
  return run(async () => {
    const id = z.uuid().parse(productId);
    const a = await actor("owner");
    const db = getDb();
    const [p] = await db.update(t.products).set({ archivedAt: new Date(), isVisible: false, updatedAt: new Date() }).where(eq(t.products.id, id)).returning({ name: t.products.name });
    if (!p) throw new UserFacingError("Produit introuvable.");
    await audit(db, a, "product.archived", "product", id, { name: p.name });
    invalidate();
  });
}

/** Déplace un produit d'un cran dans sa catégorie. */
export async function moveProductAction(productId: string, direction: "up" | "down"): Promise<ActionResult> {
  return run(async () => {
    const id = z.uuid().parse(productId);
    await actor("owner");
    const db = getDb();
    await db.transaction(async (tx) => {
      const [p] = await tx.select().from(t.products).where(eq(t.products.id, id)).limit(1);
      if (!p) return;
      const [n] = await tx
        .select()
        .from(t.products)
        .where(and(eq(t.products.categoryId, p.categoryId), isNull(t.products.archivedAt), direction === "up" ? lt(t.products.sortOrder, p.sortOrder) : gt(t.products.sortOrder, p.sortOrder)))
        .orderBy(direction === "up" ? desc(t.products.sortOrder) : asc(t.products.sortOrder))
        .limit(1);
      if (!n) return;
      await tx.update(t.products).set({ sortOrder: n.sortOrder }).where(eq(t.products.id, p.id));
      await tx.update(t.products).set({ sortOrder: p.sortOrder }).where(eq(t.products.id, n.id));
    });
    invalidate();
  });
}

const categorySchema = z.object({
  id: z.uuid(),
  name: text(40).min(2),
  title: text(80).min(2),
  note: optionalText(160),
  isActive: z.boolean(),
});

export async function saveCategoryAction(raw: z.input<typeof categorySchema>): Promise<ActionResult> {
  return run(async () => {
    const c = categorySchema.parse(raw);
    const a = await actor("owner");
    const db = getDb();
    await db.update(t.categories).set({ name: c.name, title: c.title, note: c.note, isActive: c.isActive, updatedAt: new Date() }).where(eq(t.categories.id, c.id));
    await audit(db, a, "category.updated", "category", c.id, { name: c.name, isActive: c.isActive });
    invalidate();
  });
}

export async function moveCategoryAction(categoryId: string, direction: "up" | "down"): Promise<ActionResult> {
  return run(async () => {
    const id = z.uuid().parse(categoryId);
    await actor("owner");
    const db = getDb();
    const cats = await db.select().from(t.categories).orderBy(asc(t.categories.sortOrder));
    const i = cats.findIndex((c) => c.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= cats.length) return;
    await db.update(t.categories).set({ sortOrder: cats[j]!.sortOrder }).where(eq(t.categories.id, cats[i]!.id));
    await db.update(t.categories).set({ sortOrder: cats[i]!.sortOrder }).where(eq(t.categories.id, cats[j]!.id));
    invalidate();
  });
}

const groupSchema = z.object({
  id: z.uuid().optional(),
  name: text(60).min(2),
  helper: optionalText(160),
  selectionType: z.enum(["single", "multiple"]),
  minSelect: z.number().int().min(0).max(10),
  maxSelect: z.number().int().min(1).max(20).nullable(),
  modifiers: z
    .array(z.object({ id: z.uuid().optional(), name: text(60).min(1), priceDeltaCents: z.number().int().min(0).max(5_000), isDefault: z.boolean(), isActive: z.boolean() }))
    .min(1, "Au moins une option.")
    .max(40),
});
export type ModifierGroupInput = z.input<typeof groupSchema>;

/** Suppléments, formules, choix : options et prix modifiables depuis l'admin. */
export async function saveModifierGroupAction(raw: ModifierGroupInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const parsed = groupSchema.safeParse(raw);
    if (!parsed.success) throw new UserFacingError(parsed.error.issues[0]?.message ?? "Données invalides.");
    const g = parsed.data;
    if (g.selectionType === "single" && g.minSelect > 1) throw new UserFacingError("Un choix unique ne peut exiger plus d’une sélection.");
    const a = await actor("owner");
    const db = getDb();
    const id = await db.transaction(async (tx) => {
      const values = { name: g.name, helper: g.helper, selectionType: g.selectionType, minSelect: g.minSelect, maxSelect: g.selectionType === "single" ? 1 : g.maxSelect, updatedAt: new Date() };
      let groupId = g.id;
      if (groupId) await tx.update(t.modifierGroups).set(values).where(eq(t.modifierGroups.id, groupId));
      else {
        const key = `${g.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
        const [created] = await tx.insert(t.modifierGroups).values({ ...values, key }).returning({ id: t.modifierGroups.id });
        groupId = created!.id;
      }
      const keep = g.modifiers.filter((m) => m.id).map((m) => m.id!);
      // Une option retirée est désactivée (elle peut figurer sur d'anciennes commandes).
      const existing = await tx.select({ id: t.modifiers.id }).from(t.modifiers).where(eq(t.modifiers.groupId, groupId));
      const removed = existing.map((e) => e.id).filter((x) => !keep.includes(x));
      if (removed.length) await tx.update(t.modifiers).set({ isActive: false }).where(inArray(t.modifiers.id, removed));
      for (const [i, m] of g.modifiers.entries()) {
        const v = { name: m.name, priceDeltaCents: m.priceDeltaCents, isDefault: m.isDefault, isActive: m.isActive, sortOrder: i };
        if (m.id) await tx.update(t.modifiers).set(v).where(and(eq(t.modifiers.id, m.id), eq(t.modifiers.groupId, groupId)));
        else await tx.insert(t.modifiers).values({ ...v, groupId });
      }
      return groupId;
    });
    await audit(db, a, g.id ? "modifier_group.updated" : "modifier_group.created", "modifier_group", id, { name: g.name });
    invalidate();
    return { id };
  });
}

const MAX_UPLOAD = 6 * 1024 * 1024;

/** Téléversement d'une photo produit : ré-encodée en WebP (métadonnées supprimées), stockée en base. */
export async function uploadProductImageAction(form: FormData): Promise<ActionResult<{ src: string }>> {
  return run(async () => {
    const a = await actor("owner");
    const file = form.get("file");
    if (!(file instanceof File)) throw new UserFacingError("Aucun fichier reçu.");
    if (file.size > MAX_UPLOAD) throw new UserFacingError("Image trop lourde (6 Mo maximum).");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new UserFacingError("Formats acceptés : JPEG, PNG, WebP.");
    let out: { data: Buffer; info: { width: number; height: number } };
    try {
      out = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new UserFacingError("Ce fichier n’est pas une image lisible.");
    }
    const db = getDb();
    const [asset] = await db
      .insert(t.mediaAssets)
      .values({ data: out.data, contentType: "image/webp", width: out.info.width, height: out.info.height, byteSize: out.data.length, uploadedBy: a.userId })
      .returning({ id: t.mediaAssets.id });
    await audit(db, a, "media.uploaded", "media", asset!.id, { bytes: out.data.length });
    return { src: `/media/${asset!.id}.webp` };
  });
}
