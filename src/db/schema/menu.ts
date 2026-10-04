import { boolean, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true });

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Ancre de la carte : /menu#cat-<slug> */
  slug: text("slug").notNull().unique(),
  /** Libellé court (navigation) : « Smash » */
  name: text("name").notNull(),
  /** Titre de section : « Burger Smash » */
  title: text("title").notNull(),
  /** Mention de la carte imprimée : « Servi dans un potatoes bun frais » */
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    /** Texte complémentaire (la composition vient de product_ingredients). */
    description: text("description"),
    /** Prix en centimes. null = prix non confirmé : visible mais non commandable. */
    priceCents: integer("price_cents"),
    /** false = « INDISPONIBLE » : affiché, commande bloquée immédiatement. */
    isAvailable: boolean("is_available").notNull().default(true),
    /** false = masqué de la carte publique. */
    isVisible: boolean("is_visible").notNull().default(true),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isSpicy: boolean("is_spicy").notNull().default(false),
    isVegetarian: boolean("is_vegetarian").notNull().default(false),
    /** Le client peut ajouter une note libre sur ce produit. */
    allowNotes: boolean("allow_notes").notNull().default(false),
    /** La photo affichée est représentative, pas la photo définitive du produit. */
    needsFinalProductPhoto: boolean("needs_final_product_photo").notNull().default(false),
    /** Allergènes communiqués par le restaurant (texte libre). null = non renseignés. */
    allergens: text("allergens"),
    sortOrder: integer("sort_order").notNull().default(0),
    archivedAt: ts("archived_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categoryId, t.sortOrder)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** Chemin de la banque média (src/data/media.ts) ou URL. */
    src: text("src").notNull(),
    alt: text("alt").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const productIngredients = pgTable(
  "product_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Proposé dans « Retirer » (« Sans salade »). */
    isRemovable: boolean("is_removable").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_ingredients_product_idx").on(t.productId)],
);

export const selectionType = pgEnum("selection_type", ["single", "multiple"]);

/** Groupes d'options réutilisables : Suppléments, Formule, Boisson, Topping… */
export const modifierGroups = pgTable("modifier_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  /** Aide affichée sous le titre du groupe. */
  helper: text("helper"),
  selectionType: selectionType("selection_type").notNull(),
  /** ≥ 1 : groupe obligatoire. */
  minSelect: integer("min_select").notNull().default(0),
  /** null = illimité (groupes « multiple »). */
  maxSelect: integer("max_select"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const modifiers = pgTable(
  "modifiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => modifierGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceDeltaCents: integer("price_delta_cents").notNull().default(0),
    /** Présélectionné à l'ouverture de la fiche (ex. formule « Seul »). */
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("modifiers_group_idx").on(t.groupId)],
);

/** Groupes d'options proposés pour un produit (piloté par la base, aucun burger codé en dur). */
export const productModifierGroups = pgTable(
  "product_modifier_groups",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => modifierGroups.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    /** Groupe affiché seulement si cette option est choisie (ex. « Boisson du menu » ← « En menu »). */
    visibleWhenModifierId: uuid("visible_when_modifier_id").references(() => modifiers.id, { onDelete: "set null" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.groupId] })],
);
