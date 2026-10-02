/**
 * CARTE BURGER BY M
 * Données extraites UNIQUEMENT de ce qui est lisible avec certitude sur la carte imprimée
 * (public/images/menu/carte-burgers.webp et carte-desserts.webp).
 * - Prix en centimes. `price: null` = illisible → produit affiché mais non commandable.
 * - `allergens: null` = non communiqués → TODO_PRODUCT_INFORMATION.
 * - `todo` liste ce qui reste à valider avec le restaurant.
 * Photos : la carte précise « Photos non contractuelles ». Seules les photos correspondant
 * visiblement à une recette lui sont associées ; les autres produits n'ont pas de photo.
 */
import type { OptionGroup, Product } from "@/types/product";
import { burgerOptions } from "./options";

const TODO_ALLERGENS = "TODO_PRODUCT_INFORMATION: allergènes à fournir par le restaurant";

type Draft = Omit<Product, "new" | "available" | "allergens" | "options" | "popular" | "spicy" | "vegetarian" | "image"> &
  Partial<Pick<Product, "new" | "available" | "allergens" | "options" | "popular" | "spicy" | "vegetarian" | "image">>;

function product(d: Draft): Product {
  return {
    image: null,
    popular: false,
    new: false,
    spicy: false,
    vegetarian: false,
    available: true,
    options: [],
    allergens: null,
    ...d,
    todo: [TODO_ALLERGENS, ...(d.todo ?? [])],
  };
}

const extraSize: OptionGroup = {
  id: "quantite",
  label: "Quantité",
  kind: "single",
  required: true,
  choices: [
    { id: "x3", label: "× 3", priceDelta: 0 },
    { id: "x6", label: "× 6", priceDelta: 200 },
  ],
};

const shakeToppings = ["Kinder Bueno White", "Kinder Bueno", "Oreo", "Speculoos"];
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");

export const products: Product[] = [
  /* ---------------- BURGER SMASH ---------------- */
  product({
    id: "smash-double", slug: "smash-double", name: "Smash Double", category: "smash", price: 1090,
    description: "Double steak smash, cheddar, salade, sauce smash.",
    options: burgerOptions(["salade", "sauce smash"]),
  }),
  product({
    id: "barbecu", slug: "barbecu", name: "Barbecu’", category: "smash", price: 1190,
    description: "Double steak smash, bacon, cheddar, oignons confits, salade, sauce BBQ.",
    homemade: ["Oignons confits"],
    options: burgerOptions(["oignons confits", "salade", "sauce BBQ"]),
  }),
  product({
    id: "smash-tower", slug: "smash-tower", name: "Smash Tower", category: "smash", price: 1190,
    description: "Triple steak smash, cheddar, salade, sauce smash.",
    options: burgerOptions(["salade", "sauce smash"]),
  }),
  product({
    id: "le-special", slug: "le-special", name: "Le Spécial", category: "smash", price: 1190, popular: true,
    image: "smashSpecial",
    description: "Double steak smash, extra cheddar, oignons crispy, cornichons, salade, sauce smash.",
    options: burgerOptions(["oignons crispy", "cornichons", "salade", "sauce smash"]),
  }),

  /* ---------------- BURGER CLASSIC (steak façon bouchère 150 g) ---------------- */
  product({
    id: "chicken", slug: "chicken", name: "Chicken", category: "classics", price: 1090,
    description: "Poulet pané croustillant, galette de pomme de terre, cheddar, salade, sauce mayo.",
    homemade: ["Sauce mayo"],
    options: burgerOptions(["galette de pomme de terre", "salade", "sauce mayo"]),
  }),
  product({
    id: "jalathai", slug: "jalathai", name: "Jalathai", category: "classics", price: 1090, spicy: true,
    description: "Steak, cheddar, salade, oignons rouges, piment jalapeños, sauce chili thaï.",
    options: burgerOptions(["salade", "oignons rouges", "jalapeños", "sauce chili thaï"]),
  }),
  product({
    id: "bacon-crispy", slug: "bacon-crispy", name: "Bacon Crispy", category: "classics", price: 1090,
    description: "Steak, bacon, cheddar, salade, oignons frits, cornichons, sauce smoky.",
    options: burgerOptions(["salade", "oignons frits", "cornichons", "sauce smoky"]),
  }),
  product({
    id: "roquefort", slug: "roquefort", name: "Roquefort", category: "classics", price: 1190,
    description: "Steak, salade, oignons confits, sauce roquefort.",
    homemade: ["Oignons confits", "Sauce roquefort"],
    options: burgerOptions(["salade", "oignons confits"]),
  }),
  product({
    id: "le-montagnard", slug: "le-montagnard", name: "Le Montagnard", category: "classics", price: 1190, popular: true,
    description: "Steak, bacon, raclette, oignons confits, salade, sauce smoky.",
    homemade: ["Oignons confits"],
    options: burgerOptions(["oignons confits", "salade", "sauce smoky"]),
  }),
  product({
    id: "vegg", slug: "vegg", name: "Vegg’", category: "classics", price: 990, vegetarian: true,
    description: "Steak veggie, salade, oignons rouges, sauce smoky.",
    options: burgerOptions(["salade", "oignons rouges", "sauce smoky"]),
    todo: ["Confirmer que le Vegg’ est bien végétarien (pictogramme V sur la carte)"],
  }),
  product({
    id: "spicy-chicken", slug: "spicy-chicken", name: "Spicy Chicken", category: "classics", price: 1190, spicy: true,
    image: "spicyChicken",
    description: "Poulet pané croustillant, galette de pomme de terre, cheddar, oignons rouges, salade, mayo spicy.",
    homemade: ["Mayo spicy"],
    options: burgerOptions(["galette de pomme de terre", "oignons rouges", "salade", "mayo spicy"]),
  }),

  /* ---------------- LES FRENCHY'S (baguette briochée) ---------------- */
  product({
    id: "le-chevre-miel", slug: "le-chevre-miel", name: "Le Chèvre Miel", category: "frenchys", price: 1090,
    description: "Steak, chèvre fondant, oignons confits, salade, sauce moutarde et miel.",
    homemade: ["Oignons confits"],
    options: burgerOptions(["oignons confits", "salade", "sauce moutarde et miel"]),
  }),
  product({
    id: "le-hot", slug: "le-hot", name: "Le Hot", category: "frenchys", price: 990, spicy: true,
    image: "frenchyHot",
    description: "Steak, cheddar, oignons et poivrons confits, salade, sauce barbecue spicy.",
    homemade: ["Oignons et poivrons confits", "Sauce barbecue spicy"],
    options: burgerOptions(["oignons et poivrons confits", "salade", "sauce barbecue spicy"]),
  }),
  product({
    id: "smashy", slug: "smashy", name: "Smashy", category: "frenchys", price: 1090,
    description: "Triple steak smash, cheddar, bacon, oignons crispy, cornichons, salade, sauce smash.",
    options: burgerOptions(["oignons crispy", "cornichons", "salade", "sauce smash"]),
  }),
  product({
    id: "le-forestier", slug: "le-forestier", name: "Le Forestier", category: "frenchys", price: null, popular: true,
    image: "forestier",
    description: "Filet de poulet crunch, galette de pomme de terre, oignons confits, sauce crème champignons.",
    homemade: ["Oignons confits"],
    todo: [
      "TODO_PRODUCT_INFORMATION: prix illisible (coupé sur le visuel de la carte)",
      "TODO_PRODUCT_INFORMATION: description partiellement coupée (« galette de pomm… », « sauce crème champ… ») — à confirmer",
    ],
  }),

  /* ---------------- FRITES (prix coupés sur le visuel) ---------------- */
  ...["Classique", "Cheddar", "Cheddar & oignons frits", "Cheddar & bacon"].map((v) =>
    product({
      id: `frites-${slug(v)}`, slug: `frites-${slug(v)}`, name: `Frites ${v.toLowerCase() === "classique" ? "classiques" : v.toLowerCase()}`,
      category: "frites", price: null, description: "",
      // Seule variante visible sur la photo du plateau (sauce cheddar + oignons frits) : crop « loadedFries ».
      image: v === "Cheddar & oignons frits" ? "loadedFries" : null,
      todo: ["TODO_PRODUCT_INFORMATION: prix et description illisibles sur la carte fournie"],
    }),
  ),

  /* ---------------- EXTRAS (x3 4,00 € / x6 6,00 €) ---------------- */
  ...["Mozza-sticks", "Nugget’s", "Camembert crispy", "Chili cheese"].map((n) =>
    product({
      id: `extra-${slug(n)}`, slug: `extra-${slug(n)}`, name: n, category: "extras", price: 400,
      description: "Par 3 ou par 6.", options: [extraSize],
    }),
  ),

  /* ---------------- MENU KIDS ---------------- */
  product({
    id: "menu-kids", slug: "menu-kids", name: "Menu Kids", category: "kids", price: 590,
    description: "Nugget’s ou cheese burger, frites, Caprisun, Pompot’.",
    options: [{
      id: "plat", label: "Au choix", kind: "single", required: true,
      choices: [
        { id: "nuggets", label: "Nugget’s", priceDelta: 0 },
        { id: "cheese-burger", label: "Cheese burger", priceDelta: 0 },
      ],
    }],
    todo: ["TODO_PRODUCT_INFORMATION: libellé « cheese bu… » coupé sur le visuel — confirmer « cheese burger »"],
  }),

  /* ---------------- BOISSONS ---------------- */
  product({
    id: "canette", slug: "canette", name: "Canette", category: "boissons", price: 200,
    description: "33 cl au choix.",
    options: [{
      id: "boisson", label: "Boisson", kind: "single", required: true,
      choices: [
        "Coca", "Coca Zéro", "Coca Cherry", "Ice Tea", "Oasis Tropical", "Oasis Pomme-Cassis",
        "Schweppes Agrum’", "Orangina", "7up", "Cristaline Fraise", "Cristaline Pêche",
        "Cristaline Citron", "Caprisun", "Eau", "Perrier",
      ].map((label) => ({ id: slug(label), label, priceDelta: 0 })),
    }],
    todo: [
      "TODO_PRODUCT_INFORMATION: contenance (33 cl) à confirmer",
      "TODO_PRODUCT_INFORMATION: une boisson commençant par « Fan… » est coupée sur le visuel — non intégrée",
    ],
  }),

  /* ---------------- MILKSHAKES ---------------- */
  product({
    id: "dubai-shake", slug: "dubai-shake", name: "Dubai Shake", category: "milkshakes", price: 600, image: "dubaiShake",
    description: "Glace vanille, lait, crème de pistache, Nutella, pistache concassée, chantilly.",
  }),
  product({
    id: "bueno-bomb", slug: "bueno-bomb", name: "Bueno Bomb’", category: "milkshakes", price: 450,
    description: "Glace vanille, lait, double Kinder Bueno (White + Classic), Nutella, chantilly.",
  }),
  product({
    id: "milkshake-a-composer", slug: "milkshake-a-composer", name: "Milkshake à composer", category: "milkshakes", price: 400,
    image: "shakeCaramel",
    description: "Choisis ton topping et ton coulis.",
    options: [
      { id: "topping", label: "Ton topping", kind: "single", required: true,
        choices: shakeToppings.map((t) => ({ id: slug(t), label: t, priceDelta: 0 })) },
      { id: "coulis", label: "Ton coulis", kind: "single", required: true,
        choices: ["Caramel", "Chocolat", "Nutella"].map((c) => ({ id: slug(c), label: c, priceDelta: 0 })) },
      { id: "toppings-sup", label: "Toppings supplémentaires", kind: "multiple", required: false,
        helper: "+0,50 € par topping supplémentaire",
        choices: shakeToppings.map((t) => ({ id: `sup-${slug(t)}`, label: t, priceDelta: 50 })) },
    ],
  }),

  /* ---------------- DESSERTS ---------------- */
  product({
    id: "tiramisu", slug: "tiramisu", name: "Tiramisu", category: "desserts", price: 350,
    description: "Nutella, caramel, fraisier ou pistache-framboise.",
    options: [{
      id: "parfum", label: "Parfum", kind: "single", required: true,
      choices: ["Nutella", "Caramel", "Fraisier", "Pistache-framboise"].map((p) => ({ id: slug(p), label: p, priceDelta: 0 })),
    }],
  }),
];

/** « Nos incontournables » sur l'accueil (4 produits avec une vraie photo). */
export const featuredProductIds = ["le-special", "spicy-chicken", "le-hot", "dubai-shake"];

export function getProductBySlug(s: string) {
  return products.find((p) => p.slug === s);
}
export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}
