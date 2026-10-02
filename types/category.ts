export type CategoryId =
  | "smash"
  | "classics"
  | "frenchys"
  | "frites"
  | "extras"
  | "kids"
  | "desserts"
  | "milkshakes"
  | "boissons";

export interface Category {
  id: CategoryId;
  /** Libellé court (barre de catégories, accueil). */
  name: string;
  /** Titre de section sur la carte. */
  title: string;
  /** Mention issue de la carte imprimée (ex. « Servi dans un potatoes bun frais »). */
  note?: string;
  /** Photo réelle représentative (accès rapide de l'accueil). */
  imageId?: string;
  order: number;
  active: boolean;
}

/** Ancre de section sur /menu : #cat-smash, #cat-classics… */
export const categoryAnchor = (id: string) => `cat-${id}`;
