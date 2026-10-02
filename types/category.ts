export type CategoryId =
  | "smash"
  | "classics"
  | "frenchys"
  | "frites"
  | "extras"
  | "kids"
  | "boissons"
  | "milkshakes"
  | "desserts";

/** Regroupements affichés dans la sous-navigation de /menu. */
export type MenuGroupId = "smash" | "classics" | "frenchys" | "sides" | "boissons" | "desserts";

export interface Category {
  id: CategoryId;
  group: MenuGroupId;
  name: string;
  /** Titre éditorial affiché en grand sur la carte. */
  title: string;
  /** Mention issue de la carte imprimée (ex. « Servi dans un potatoes bun frais »). */
  note?: string;
  imageId?: string;
  order: number;
  active: boolean;
}

export interface MenuGroup {
  id: MenuGroupId;
  label: string;
}
