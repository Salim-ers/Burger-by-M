import type { Cents } from "./product";

export interface SelectedOption {
  groupId: string;
  groupLabel: string;
  choiceId: string;
  label: string;
  priceDelta: Cents;
}

export interface CartItem {
  /** Identifiant de ligne : produit + combinaison d'options. */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  /** Prix unitaire options incluses, en centimes. */
  unitPrice: Cents;
  quantity: number;
  options: SelectedOption[];
  image: string | null;
}

export type PickupChoice =
  | { mode: "asap" }
  | { mode: "scheduled"; time: string /* ISO */ };
