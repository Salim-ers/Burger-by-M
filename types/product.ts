import type { CategoryId } from "./category";

/** Prix toujours exprimés en centimes (entiers) pour éviter les erreurs d'arrondi. */
export type Cents = number;

export interface OptionChoice {
  id: string;
  label: string;
  priceDelta: Cents;
}

export interface OptionGroup {
  id: string;
  label: string;
  kind: "single" | "multiple";
  required: boolean;
  /** Pour kind="multiple" : nombre maximum de choix (facultatif). */
  max?: number;
  helper?: string;
  choices: OptionChoice[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  description: string;
  /** null = prix non lisible / non confirmé → produit non commandable. */
  price: Cents | null;
  /** Identifiant dans data/images.ts, ou null si aucune vraie photo ne correspond. */
  image: string | null;
  /** Coeur « Best seller » sur la carte imprimée. */
  popular: boolean;
  new: boolean;
  spicy: boolean;
  vegetarian: boolean;
  available: boolean;
  options: OptionGroup[];
  /** null = allergènes non communiqués (TODO_PRODUCT_INFORMATION). */
  allergens: string[] | null;
  /** Éléments marqués « * fait maison » sur la carte. */
  homemade?: string[];
  /** Points restant à valider avec le restaurant. */
  todo?: string[];
}
