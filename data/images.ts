/**
 * Registre des photos réelles Burger By M.
 * Pour remplacer une image : déposer le nouveau fichier dans /public/images/… puis mettre à jour
 * `src`, `width` et `height` ici. Aucune autre modification n'est nécessaire.
 * NB : les photos fournies font 720 px de large — prévoir des originaux HD pour la production.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const images = {
  smashSpecial: {
    src: "/images/food/smash-le-special.webp",
    width: 720,
    height: 1186,
    alt: "Smash burger Burger By M : cheddar fondant, oignons crispy, cornichon et sauce smash",
  },
  frenchyHot: {
    src: "/images/food/frenchy-le-hot.webp",
    width: 720,
    height: 1186,
    alt: "Frenchy Le Hot : baguette briochée, steak, cheddar, oignons et poivrons confits",
  },
  spicyChicken: {
    src: "/images/food/classic-spicy-chicken.webp",
    width: 720,
    height: 1186,
    alt: "Burger au poulet pané croustillant, cheddar, oignons rouges et salade, tenu à la main",
  },
  forestier: {
    src: "/images/food/frenchy-le-forestier.webp",
    width: 720,
    height: 385,
    alt: "Frenchy Le Forestier : filet de poulet crunch nappé de sauce crème champignons",
  },
  plateau: {
    src: "/images/food/plateau-burgers-frites.webp",
    width: 720,
    height: 1186,
    alt: "Plateau Burger By M : burgers, frites maison et frites cheddar jalapeños",
  },
  shakeCaramel: {
    src: "/images/food/milkshake-caramel-bueno.webp",
    width: 720,
    height: 1186,
    alt: "Milkshake Burger By M au coulis caramel, chantilly et Kinder Bueno white",
  },
  dubaiShake: {
    src: "/images/food/dubai-shake.webp",
    width: 720,
    height: 1186,
    alt: "Dubai Shake : crème de pistache, Nutella, pistache concassée et chantilly",
  },
  storefront: {
    src: "/images/restaurant/devanture-terrasse.webp",
    width: 720,
    height: 1186,
    alt: "Devanture et terrasse de Burger By M, 19 avenue de la Gare à Rantigny",
  },
} satisfies Record<string, SiteImage>;

export type ImageId = keyof typeof images;

export function getImage(id: string | null | undefined): SiteImage | null {
  if (!id) return null;
  return (images as Record<string, SiteImage>)[id] ?? null;
}
