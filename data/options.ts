import type { OptionGroup } from "@/types/product";
import { orderingDefaults } from "./restaurant";

/** Suppléments relevés sur la carte imprimée (prix en centimes). À reconfirmer avant production. */
export const supplementsGroup: OptionGroup = {
  id: "supplements",
  label: "Suppléments",
  kind: "multiple",
  required: false,
  choices: [
    { id: "galette", label: "Galette de pomme de terre", priceDelta: 100 },
    { id: "bacon", label: "Bacon", priceDelta: 150 },
    { id: "cheddar", label: "Cheddar", priceDelta: 80 },
    { id: "jalapenos", label: "Piment jalapeños", priceDelta: 50 },
  ],
};

/**
 * Formule « MENU +2 € » visible sur la carte imprimée.
 * TODO_PRODUCT_INFORMATION : composition exacte du menu et catégories concernées à confirmer.
 */
export const formulaGroup: OptionGroup = {
  id: "formule",
  label: "Formule",
  kind: "single",
  required: true,
  helper: "Supplément menu indiqué sur la carte du restaurant.",
  choices: [
    { id: "seul", label: "Seul", priceDelta: 0 },
    { id: "menu", label: "En menu", priceDelta: orderingDefaults.menuFormulaPrice },
  ],
};

/** Génère le groupe « Retirer un ingrédient » à partir des ingrédients réellement présents. */
export function removalsGroup(ingredients: string[]): OptionGroup {
  return {
    id: "retirer",
    label: "Retirer un ingrédient",
    kind: "multiple",
    required: false,
    choices: ingredients.map((ing) => ({
      id: `sans-${ing.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`,
      label: `Sans ${ing}`,
      priceDelta: 0,
    })),
  };
}

export function burgerOptions(removable: string[]): OptionGroup[] {
  return [formulaGroup, supplementsGroup, removalsGroup(removable)];
}
