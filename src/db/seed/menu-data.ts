/**
 * CARTE INITIALE — seed de la base (tout est ensuite modifiable depuis /admin/menu).
 * Source : carte imprimée Burger By M (assets/sources/carte-complete-hd.webp, carte-desserts-hd.webp).
 * Prix en centimes. priceCents: null = prix non lisible sur la carte → produit visible, non commandable
 * tant que le prix n'est pas saisi dans l'administration. Aucun prix n'est inventé.
 */
import { productPhoto, type ProductPhotoKey } from "@/data/media";

export type SeedModifierGroupKey =
  | "formule"
  | "boisson-menu"
  | "supplements"
  | "extras-quantite"
  | "kids-plat"
  | "canette"
  | "shake-topping"
  | "shake-coulis"
  | "shake-toppings-sup"
  | "tiramisu-parfum";

export interface SeedModifierGroup {
  key: SeedModifierGroupKey;
  name: string;
  helper?: string;
  selectionType: "single" | "multiple";
  minSelect: number;
  maxSelect: number | null;
  modifiers: { name: string; priceDeltaCents: number; isDefault?: boolean }[];
}

const CANETTES = [
  "Coca-Cola", "Coca-Cola Zéro", "Coca-Cola Cherry", "Ice Tea", "Oasis Tropical", "Oasis Pomme Cassis", "Fanta",
  "Schweppes Agrum’", "Orangina", "7UP", "Cristaline Fraise", "Cristaline Pêche", "Cristaline Citron", "Capri-Sun", "Eau", "Perrier",
];
const SHAKE_TOPPINGS = ["Kinder Bueno White", "Kinder Bueno", "Oreo", "Speculoos"];

export const MODIFIER_GROUPS: SeedModifierGroup[] = [
  {
    key: "formule",
    name: "Formule",
    helper: "Menu : frites + canette (+2,00 € indiqué sur la carte).",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { name: "Seul", priceDeltaCents: 0, isDefault: true },
      { name: "En menu (frites + canette)", priceDeltaCents: 200 },
    ],
  },
  {
    key: "boisson-menu",
    name: "Boisson du menu",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: CANETTES.map((name) => ({ name, priceDeltaCents: 0 })),
  },
  {
    key: "supplements",
    name: "Ajouter",
    selectionType: "multiple",
    minSelect: 0,
    maxSelect: null,
    modifiers: [
      { name: "Cheddar", priceDeltaCents: 80 },
      { name: "Bacon", priceDeltaCents: 150 },
      { name: "Galette de pomme de terre", priceDeltaCents: 100 },
      { name: "Piment jalapeños", priceDeltaCents: 50 },
    ],
  },
  {
    key: "extras-quantite",
    name: "Quantité",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { name: "× 3", priceDeltaCents: 0, isDefault: true },
      { name: "× 6", priceDeltaCents: 200 },
    ],
  },
  {
    key: "kids-plat",
    name: "Au choix",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: [
      { name: "Nuggets", priceDeltaCents: 0 },
      { name: "Cheese burger", priceDeltaCents: 0 },
    ],
  },
  {
    key: "canette",
    name: "Boisson",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: CANETTES.map((name) => ({ name, priceDeltaCents: 0 })),
  },
  {
    key: "shake-topping",
    name: "Topping",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: SHAKE_TOPPINGS.map((name) => ({ name, priceDeltaCents: 0 })),
  },
  {
    key: "shake-coulis",
    name: "Coulis",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: ["Caramel", "Chocolat", "Nutella"].map((name) => ({ name, priceDeltaCents: 0 })),
  },
  {
    key: "shake-toppings-sup",
    name: "Topping supplémentaire",
    helper: "+0,50 € par topping supplémentaire.",
    selectionType: "multiple",
    minSelect: 0,
    maxSelect: null,
    modifiers: SHAKE_TOPPINGS.map((name) => ({ name, priceDeltaCents: 50 })),
  },
  {
    key: "tiramisu-parfum",
    name: "Parfum",
    selectionType: "single",
    minSelect: 1,
    maxSelect: 1,
    modifiers: ["Nutella", "Caramel", "Fraisier", "Pistache / Framboise"].map((name) => ({ name, priceDeltaCents: 0 })),
  },
];

export interface SeedCategory {
  slug: string;
  name: string;
  title: string;
  note?: string;
}

export const CATEGORIES: SeedCategory[] = [
  { slug: "smash", name: "Smash", title: "Burger Smash", note: "Servis dans un potatoes bun frais" },
  { slug: "classic", name: "Classic", title: "Burger Classic", note: "Steak façon bouchère 150 g" },
  { slug: "frenchys", name: "Frenchy’s", title: "Les Frenchy’s", note: "Servis dans une baguette briochée" },
  { slug: "frites", name: "Frites", title: "Frites" },
  { slug: "extras", name: "Extras", title: "Extras", note: "Par 3 ou par 6" },
  { slug: "kids", name: "Kids", title: "Menu Kids" },
  { slug: "boissons", name: "Boissons", title: "Boissons", note: "Canettes" },
  { slug: "desserts", name: "Desserts", title: "Desserts & milkshakes" },
];

/** Ingrédient : texte affiché ; `fixed` = non proposé dans « Retirer » (base du produit). */
type Ingredient = string | { name: string; fixed: true };

export interface SeedProduct {
  slug: string;
  category: string;
  name: string;
  priceCents: number | null;
  ingredients: Ingredient[];
  description?: string;
  groups: { key: SeedModifierGroupKey; visibleWhen?: { group: SeedModifierGroupKey; modifier: string } }[];
  photo?: ProductPhotoKey;
  /** La photo est représentative (pas le produit exact) : à remplacer par une photo définitive. */
  needsFinalProductPhoto?: boolean;
  bestSeller?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  allowNotes?: boolean;
}

/** Burger / Frenchy : formule (menu + boisson conditionnelle) puis suppléments. */
const BURGER_GROUPS: SeedProduct["groups"] = [
  { key: "formule" },
  { key: "boisson-menu", visibleWhen: { group: "formule", modifier: "En menu (frites + canette)" } },
  { key: "supplements" },
];

const steak = (s: string) => ({ name: s, fixed: true as const });

export const PRODUCTS: SeedProduct[] = [
  // ---------------- SMASH ----------------
  { slug: "smash-double", category: "smash", name: "Smash Double", priceCents: 1090, photo: "smash-double", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Double steak smash"), "Cheddar", "Salade", "Sauce smash"] },
  { slug: "barbeuc", category: "smash", name: "Barbeuc’", priceCents: 1190, photo: "barbeuc", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Double steak smash"), "Bacon", "Cheddar", "Oignons confits", "Salade", "Sauce BBQ"] },
  { slug: "smash-tower", category: "smash", name: "Smash Tower", priceCents: 1190, photo: "smash-tower", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Triple steak smash"), "Cheddar", "Salade", "Sauce smash"] },
  { slug: "le-special", category: "smash", name: "Le Spécial", priceCents: 1190, photo: "le-special", groups: BURGER_GROUPS, allowNotes: true, bestSeller: true,
    ingredients: [steak("Double steak smash"), "Extra cheddar", "Oignons crispy", "Cornichons", "Salade", "Sauce smash"] },

  // ---------------- CLASSIC (steak façon bouchère 150 g) ----------------
  { slug: "chicken", category: "classic", name: "Chicken", priceCents: 1090, photo: "chicken", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Poulet pané croustillant"), "Galette de pomme de terre", "Cheddar", "Salade", "Sauce mayo"] },
  { slug: "jalathai", category: "classic", name: "Jalathai", priceCents: 1090, photo: "jalathai", groups: BURGER_GROUPS, allowNotes: true, spicy: true,
    ingredients: [steak("Steak"), "Cheddar", "Salade", "Oignons rouges", "Piment jalapeños", "Sauce chili thaï"] },
  { slug: "bacon-crispy", category: "classic", name: "Bacon Crispy", priceCents: 1090, photo: "bacon-crispy", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Steak"), "Bacon", "Cheddar", "Salade", "Oignons frits", "Cornichons", "Sauce smoky"] },
  { slug: "roquefort", category: "classic", name: "Roquefort", priceCents: 1190, photo: "roquefort", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Steak"), "Salade", "Oignons confits", "Sauce roquefort"] },
  { slug: "le-montagnard", category: "classic", name: "Le Montagnard", priceCents: 1190, photo: "le-montagnard", groups: BURGER_GROUPS, allowNotes: true, bestSeller: true,
    ingredients: [steak("Steak"), "Bacon", "Raclette", "Oignons confits", "Salade", "Sauce smoky"] },
  { slug: "vegg", category: "classic", name: "Vegg’", priceCents: 990, photo: "vegg", groups: BURGER_GROUPS, allowNotes: true, vegetarian: true,
    ingredients: [steak("Steak veggie"), "Salade", "Oignons rouges", "Sauce smoky"] },
  { slug: "spicy-chicken", category: "classic", name: "Spicy Chicken", priceCents: 1190, photo: "spicy-chicken", groups: BURGER_GROUPS, allowNotes: true, spicy: true,
    ingredients: [steak("Poulet pané croustillant"), "Galette de pomme de terre", "Cheddar", "Oignons rouges", "Salade", "Mayo spicy"] },

  // ---------------- LES FRENCHY'S (baguette briochée) ----------------
  { slug: "le-chevre-miel", category: "frenchys", name: "Le Chèvre Miel", priceCents: 1090, photo: "le-chevre-miel", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Steak"), "Chèvre fondant", "Oignons confits", "Salade", "Sauce moutarde au miel"] },
  { slug: "le-hot", category: "frenchys", name: "Le Hot", priceCents: 990, photo: "le-hot", groups: BURGER_GROUPS, allowNotes: true, spicy: true,
    ingredients: [steak("Steak"), "Cheddar", "Oignons et poivrons confits", "Salade", "Sauce barbecue spicy"] },
  { slug: "smashy", category: "frenchys", name: "Smashy", priceCents: 1090, photo: "smashy", groups: BURGER_GROUPS, allowNotes: true,
    ingredients: [steak("Triple steak smash"), "Cheddar", "Bacon", "Cornichons", "Salade", "Sauce smash"] },
  { slug: "le-forestier", category: "frenchys", name: "Le Forestier", priceCents: 1090, photo: "le-forestier", groups: BURGER_GROUPS, allowNotes: true, bestSeller: true,
    ingredients: [steak("Filet de poulet crunch"), "Galette de pomme de terre", "Oignons confits", "Sauce crème champignon"] },

  // ---------------- FRITES (prix non indiqués sur la carte : à saisir dans l'admin) ----------------
  { slug: "frites-classiques", category: "frites", name: "Frites classiques", priceCents: null, ingredients: [], groups: [], photo: "frites-classiques", needsFinalProductPhoto: true },
  { slug: "frites-cheddar", category: "frites", name: "Frites cheddar", priceCents: null, ingredients: [], groups: [], photo: "frites-cheddar", needsFinalProductPhoto: true },
  { slug: "frites-cheddar-oignons-frits", category: "frites", name: "Frites cheddar & oignons frits", priceCents: null, ingredients: [], groups: [], photo: "frites-cheddar-oignons", needsFinalProductPhoto: true },
  { slug: "frites-cheddar-bacon", category: "frites", name: "Frites cheddar & bacon", priceCents: null, ingredients: [], groups: [], photo: "frites-cheddar", needsFinalProductPhoto: true },

  // ---------------- EXTRAS (×3 4,00 € / ×6 6,00 €) ----------------
  ...["Mozza sticks", "Nuggets", "Camembert crispy", "Chili cheese"].map<SeedProduct>((name) => ({
    slug: name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-"),
    category: "extras",
    name,
    priceCents: 400,
    ingredients: [],
    description: "Par 3 ou par 6.",
    groups: [{ key: "extras-quantite" }],
  })),

  // ---------------- MENU KIDS ----------------
  { slug: "menu-kids", category: "kids", name: "Menu Kids", priceCents: 590, groups: [{ key: "kids-plat" }],
    ingredients: [{ name: "Frites", fixed: true }, { name: "Capri-Sun", fixed: true }, { name: "Pom’Potes", fixed: true }],
    description: "Nuggets ou cheese burger, au choix." },

  // ---------------- BOISSONS ----------------
  { slug: "canette", category: "boissons", name: "Canette", priceCents: 200, ingredients: [], description: "Au choix parmi les boissons de la carte.", groups: [{ key: "canette" }] },

  // ---------------- DESSERTS & MILKSHAKES ----------------
  { slug: "dubai-shake", category: "desserts", name: "Dubai Shake", priceCents: 600, photo: "dubai-shake", groups: [],
    ingredients: [{ name: "Glace vanille", fixed: true }, { name: "Lait", fixed: true }, { name: "Crème de pistache", fixed: true }, { name: "Nutella", fixed: true }, "Pistache concassée", "Chantilly"] },
  { slug: "bueno-bomb", category: "desserts", name: "Bueno Bomb’", priceCents: 450, groups: [],
    ingredients: [{ name: "Glace vanille", fixed: true }, { name: "Lait", fixed: true }, { name: "Double Kinder Bueno (White + Classic)", fixed: true }, "Nutella", "Chantilly"] },
  // Photo d'une composition possible (coulis caramel, Bueno White) : signalée « photo d'illustration ».
  { slug: "milkshake-a-composer", category: "desserts", name: "Milkshake à composer", priceCents: 400, photo: "milkshake-caramel", needsFinalProductPhoto: true,
    description: "Choisissez votre topping et votre coulis.", ingredients: [],
    groups: [{ key: "shake-topping" }, { key: "shake-coulis" }, { key: "shake-toppings-sup" }] },
  { slug: "tiramisu", category: "desserts", name: "Tiramisu", priceCents: 350, ingredients: [], groups: [{ key: "tiramisu-parfum" }] },
];

/** Horaires relevés sur la carte : mardi 18h-22h ; mercredi → dimanche 11h-14h et 18h-22h (22h30 vendredi et samedi). Lundi fermé. */
export const OPENING_HOURS: { day: number; opensAt: string; closesAt: string }[] = [
  { day: 2, opensAt: "18:00", closesAt: "22:00" },
  ...[3, 4, 0].flatMap((day) => [
    { day, opensAt: "11:00", closesAt: "14:00" },
    { day, opensAt: "18:00", closesAt: "22:00" },
  ]),
  ...[5, 6].flatMap((day) => [
    { day, opensAt: "11:00", closesAt: "14:00" },
    { day, opensAt: "18:00", closesAt: "22:30" },
  ]),
];

export const SETTINGS = {
  name: "Burger By M",
  street: "19 avenue de la Gare",
  postalCode: "60290",
  city: "Rantigny",
  phone: "03 44 24 89 18",
} as const;

export { productPhoto };
