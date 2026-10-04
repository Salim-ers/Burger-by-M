import { media } from "@/data/media";

/** Banque d'images proposée dans l'éditeur de produit (visuels de la carte + photos réelles). */
export const imageBank = Object.values(media)
  .filter((m) => m.kind === "product" || m.kind === "photo")
  .map((m) => ({ src: m.src, alt: m.alt }));
