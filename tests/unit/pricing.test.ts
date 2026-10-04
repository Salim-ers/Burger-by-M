import { describe, expect, it } from "vitest";
import { defaultModifierIds, missingRequiredGroups, priceLine, pruneHiddenSelections, lineKey } from "@/features/menu/pricing";
import type { MenuProduct } from "@/features/menu/types";

const formule = {
  id: "g-formule", key: "formule", name: "Formule", helper: null, selectionType: "single" as const, minSelect: 1, maxSelect: 1, visibleWhenModifierId: null,
  modifiers: [
    { id: "m-seul", name: "Seul", priceDeltaCents: 0, isDefault: true },
    { id: "m-menu", name: "En menu", priceDeltaCents: 200, isDefault: false },
  ],
};
const boisson = {
  id: "g-boisson", key: "boisson-menu", name: "Boisson du menu", helper: null, selectionType: "single" as const, minSelect: 1, maxSelect: 1, visibleWhenModifierId: "m-menu",
  modifiers: [
    { id: "m-coca", name: "Coca-Cola", priceDeltaCents: 0, isDefault: false },
    { id: "m-eau", name: "Eau", priceDeltaCents: 0, isDefault: false },
  ],
};
const supplements = {
  id: "g-sup", key: "supplements", name: "Ajouter", helper: null, selectionType: "multiple" as const, minSelect: 0, maxSelect: null, visibleWhenModifierId: null,
  modifiers: [
    { id: "m-cheddar", name: "Cheddar", priceDeltaCents: 80, isDefault: false },
    { id: "m-bacon", name: "Bacon", priceDeltaCents: 150, isDefault: false },
  ],
};

const product: MenuProduct = {
  id: "p-smash", slug: "smash-double", categoryId: "c", categorySlug: "smash", name: "Smash Double", description: null, priceCents: 1090,
  isAvailable: true, isBestSeller: false, isSpicy: false, isVegetarian: false, allowNotes: true, allergens: null, needsFinalProductPhoto: false, image: null,
  ingredients: [
    { id: "i-steak", name: "Double steak smash", isRemovable: false },
    { id: "i-salade", name: "Salade", isRemovable: true },
  ],
  modifierGroups: [formule, boisson, supplements],
};

const base = { productId: "p-smash", quantity: 1, modifierIds: ["m-seul"], removedIngredientIds: [] as string[] };

describe("priceLine", () => {
  it("calcule le prix de base avec les options par défaut", () => {
    const r = priceLine(product, base);
    expect(r.ok && r.line.unitPriceCents).toBe(1090);
  });

  it("additionne suppléments et formule, multiplie par la quantité", () => {
    const r = priceLine(product, { ...base, quantity: 2, modifierIds: ["m-menu", "m-coca", "m-cheddar", "m-bacon"] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.line.unitPriceCents).toBe(1090 + 200 + 80 + 150);
    expect(r.line.lineTotalCents).toBe((1090 + 200 + 80 + 150) * 2);
    expect(r.line.modifiers.map((m) => m.name)).toEqual(["En menu", "Coca-Cola", "Cheddar", "Bacon"]);
  });

  it("refuse un groupe obligatoire manquant (boisson du menu)", () => {
    const r = priceLine(product, { ...base, modifierIds: ["m-menu"] });
    expect(r).toEqual({ ok: false, error: { code: "missing_required", groupName: "Boisson du menu" } });
  });

  it("refuse un choix dans un groupe masqué", () => {
    const r = priceLine(product, { ...base, modifierIds: ["m-seul", "m-coca"] });
    expect(r.ok).toBe(false);
  });

  it("refuse deux choix dans un groupe à choix unique", () => {
    expect(priceLine(product, { ...base, modifierIds: ["m-seul", "m-menu", "m-coca"] }).ok).toBe(false);
  });

  it("refuse une option inconnue (falsification)", () => {
    expect(priceLine(product, { ...base, modifierIds: ["m-seul", "m-gratuit"] })).toEqual({ ok: false, error: { code: "invalid_modifier" } });
  });

  it("refuse le retrait d'un ingrédient non retirable", () => {
    expect(priceLine(product, { ...base, removedIngredientIds: ["i-steak"] }).ok).toBe(false);
    const ok = priceLine(product, { ...base, removedIngredientIds: ["i-salade"] });
    expect(ok.ok && ok.line.removedIngredients).toEqual(["Salade"]);
  });

  it("refuse les quantités hors bornes et non entières", () => {
    for (const quantity of [0, -1, 21, 1.5]) expect(priceLine(product, { ...base, quantity }).ok).toBe(false);
  });

  it("refuse un produit indisponible ou sans prix confirmé", () => {
    expect(priceLine({ ...product, isAvailable: false }, base)).toMatchObject({ ok: false, error: { code: "product_unavailable" } });
    expect(priceLine({ ...product, priceCents: null }, base)).toMatchObject({ ok: false, error: { code: "price_unconfirmed" } });
  });

  it("nettoie la note et refuse une note si le produit ne l'autorise pas", () => {
    const r = priceLine(product, { ...base, note: "  sans <b>sel</b>  " });
    expect(r.ok && r.line.note).toBe("sans bsel/b");
    expect(priceLine({ ...product, allowNotes: false }, { ...base, note: "x" }).ok).toBe(false);
  });
});

describe("sélections", () => {
  it("applique les options par défaut", () => {
    expect(defaultModifierIds(product)).toEqual(["m-seul"]);
  });

  it("retire les choix d'un groupe devenu masqué", () => {
    expect(pruneHiddenSelections(product, ["m-seul", "m-coca", "m-bacon"]).sort()).toEqual(["m-bacon", "m-seul"]);
  });

  it("liste les groupes obligatoires incomplets", () => {
    expect(missingRequiredGroups(product, ["m-menu"]).map((g) => g.key)).toEqual(["boisson-menu"]);
  });

  it("identifie une ligne indépendamment de l'ordre des options", () => {
    expect(lineKey({ productId: "p", modifierIds: ["a", "b"], removedIngredientIds: [] })).toBe(lineKey({ productId: "p", modifierIds: ["b", "a"], removedIngredientIds: [] }));
  });
});
