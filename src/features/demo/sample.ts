/**
 * Commande fictive créée par le bouton « Simuler une commande » de la cuisine de démonstration :
 * permet de montrer la cuisine seule, sur une tablette qui n'a pas passé de commande elle-même.
 * Noms, recettes et prix viennent de la carte initiale : aucun produit ni prix n'est inventé ici.
 */
import { PRODUCTS } from "@/db/seed/menu-data";
import { createDemoOrder, type DemoOrderInput } from "./store";

type Sample = { slug: string; menu?: string; extras?: { name: string; priceDeltaCents: number }[]; removed?: string[]; note?: string };

/** Compositions plausibles, tirées de la carte. Formule menu : +2,00 € avec boisson. */
const BASKETS: Sample[][] = [
  [{ slug: "smash-double", menu: "Coca-Cola", removed: ["Salade"] }],
  [{ slug: "le-montagnard", menu: "Oasis Tropical", note: "Bien cuit" }, { slug: "dubai-shake" }],
  [{ slug: "le-hot" }, { slug: "smash-tower", extras: [{ name: "Bacon", priceDeltaCents: 150 }] }],
  [{ slug: "spicy-chicken", menu: "Ice Tea", removed: ["Oignons rouges"] }],
  [{ slug: "barbeuc", extras: [{ name: "Cheddar", priceDeltaCents: 80 }], note: "Sauce à part" }, { slug: "bueno-bomb" }],
  [{ slug: "le-forestier", menu: "Coca-Cola" }, { slug: "le-chevre-miel" }],
];
const CUSTOMERS = [
  ["Yanis", "Benali"],
  ["Sarah", "Martin"],
  ["Lucas", "Dubois"],
  ["Inès", "Karimi"],
  ["Thomas", "Robert"],
  ["Léa", "Moreau"],
] as const;

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!;

export function simulateDemoOrder() {
  const lines: DemoOrderInput["lines"] = pick(BASKETS).flatMap((s) => {
    const product = PRODUCTS.find((p) => p.slug === s.slug);
    if (!product || product.priceCents === null) return [];
    const modifiers = [
      ...(s.menu ? [{ groupName: "Formule", name: "En menu (frites + canette)", priceDeltaCents: 200 }, { groupName: "Boisson du menu", name: s.menu, priceDeltaCents: 0 }] : []),
      ...(s.extras ?? []).map((e) => ({ groupName: "Ajouter", ...e })),
    ];
    const unit = product.priceCents + modifiers.reduce((n, m) => n + m.priceDeltaCents, 0);
    return [{ productName: product.name, quantity: 1, unitPriceCents: unit, lineTotalCents: unit, removedIngredients: s.removed ?? [], note: s.note ?? null, modifiers }];
  });
  const [firstName, lastName] = pick(CUSTOMERS);
  return createDemoOrder({
    customer: { firstName, lastName, phone: "06 00 00 00 00" },
    requestedTime: new Date(Date.now() + 20 * 60_000).toISOString(),
    isAsap: true,
    method: Math.random() < 0.5 ? "card" : "on_site",
    lines,
    received: true,
  });
}
