/**
 * Registre des photos réelles Burger By M — chaque image a été revue une par une.
 *
 * Inventaire (fichier → usage) :
 *  heroBurger / smashSpecial   smash-le-special.webp      Le Spécial sur plaque inox, cheddar qui coule. Fond sombre,
 *                                                         contraste fort, burger entier : photo du hero et de la section signature.
 *  chickenBurger / spicyChicken classic-spicy-chicken.webp Spicy Chicken tenu au gant noir, fond gris clair.
 *  frenchy / frenchyHot        frenchy-le-hot.webp        Le Hot en diagonale sur inox : la photo la plus spectaculaire des Frenchy's.
 *  forestier                   frenchy-le-forestier.webp  Seule photo horizontale (720×385) : Le Forestier de profil.
 *  loadedFries                 plateau-burgers-frites.webp Crop serré du bac de frites cheddar / oignons frits (haut droite du plateau).
 *  plateau                     plateau-burgers-frites.webp Plateau complet (burgers + frites) — usage éditorial uniquement.
 *  milkshakePistachio / dubaiShake dubai-shake.webp       Dubai Shake (pistache, Nutella).
 *  milkshakeCaramel / shakeCaramel milkshake-caramel-bueno.webp Shake coulis caramel + Kinder Bueno White = « milkshake à composer ».
 *  restaurantFront / storefront devanture-terrasse.webp   Façade, enseigne ronde, numéro de téléphone.
 *  terrace                     devanture-terrasse.webp    Même fichier, cadré bas sur la terrasse.
 *  menuImage                   carte-burgers.webp         Carte imprimée (référence des prix) — non utilisée en visuel.
 *
 * `position` : object-position propre à chaque image (jamais le même crop partout).
 * `zoom` / `origin` : recadrage serré par transform (crop dans une photo plus large).
 * NB : les fichiers fournis font 720 px de large — prévoir des originaux HD pour la production.
 */
import type { CSSProperties } from "react";

export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  position: string;
  zoom?: number;
  origin?: string;
}

const SPECIAL = "/images/food/smash-le-special.webp";
const PLATEAU = "/images/food/plateau-burgers-frites.webp";
const FRONT = "/images/restaurant/devanture-terrasse.webp";

export const images = {
  smashSpecial: {
    src: SPECIAL,
    width: 720,
    height: 1186,
    alt: "Le Spécial : double steak smashé, extra cheddar fondu, oignons crispy, cornichon et sauce smash",
    position: "50% 55%",
  },
  spicyChicken: {
    src: "/images/food/classic-spicy-chicken.webp",
    width: 720,
    height: 1186,
    alt: "Spicy Chicken : poulet pané croustillant, cheddar, oignons rouges et salade, tenu au gant noir",
    position: "45% 58%",
  },
  frenchyHot: {
    src: "/images/food/frenchy-le-hot.webp",
    width: 720,
    height: 1186,
    alt: "Frenchy Le Hot : baguette briochée, steak, cheddar, oignons et poivrons confits",
    position: "45% 50%",
  },
  forestier: {
    src: "/images/food/frenchy-le-forestier.webp",
    width: 720,
    height: 385,
    alt: "Frenchy Le Forestier : filet de poulet crunch nappé de sauce crème champignons",
    position: "50% 55%",
  },
  loadedFries: {
    src: PLATEAU,
    width: 720,
    height: 1186,
    alt: "Frites cheddar et oignons frits, rondelles de jalapeños",
    position: "86% 34%",
    zoom: 1.75,
    origin: "86% 34%",
  },
  plateau: {
    src: PLATEAU,
    width: 720,
    height: 1186,
    alt: "Plateau Burger By M : burgers, frites maison et frites cheddar",
    position: "50% 45%",
  },
  shakeCaramel: {
    src: "/images/food/milkshake-caramel-bueno.webp",
    width: 720,
    height: 1186,
    alt: "Milkshake à composer : coulis caramel, chantilly et Kinder Bueno White",
    position: "50% 40%",
  },
  dubaiShake: {
    src: "/images/food/dubai-shake.webp",
    width: 720,
    height: 1186,
    alt: "Dubai Shake : crème de pistache, Nutella, pistache concassée et chantilly",
    position: "50% 38%",
  },
  storefront: {
    src: FRONT,
    width: 720,
    height: 1186,
    alt: "Devanture de Burger By M, 19 avenue de la Gare à Rantigny, enseigne ronde et numéro de téléphone",
    position: "50% 42%",
  },
  terrace: {
    src: FRONT,
    width: 720,
    height: 1186,
    alt: "Terrasse de Burger By M : tables noires et parasol devant le restaurant",
    position: "50% 80%",
  },
} satisfies Record<string, SiteImage>;

/** Alias de l'inventaire (noms de la direction artistique). */
export const shots = {
  heroBurger: images.smashSpecial,
  smashBurger: images.smashSpecial,
  chickenBurger: images.spicyChicken,
  frenchy: images.frenchyHot,
  loadedFries: images.loadedFries,
  milkshakeCaramel: images.shakeCaramel,
  milkshakePistachio: images.dubaiShake,
  restaurantFront: images.storefront,
  terrace: images.terrace,
};

export const menuImage = { src: "/images/menu/carte-burgers.webp", width: 720, height: 582 } as const;

export type ImageId = keyof typeof images;

export function getImage(id: string | null | undefined): SiteImage | null {
  if (!id) return null;
  return (images as Record<string, SiteImage>)[id] ?? null;
}

/** Styles d'image (cadrage + zoom éventuel) à appliquer sur un <Image fill>. */
export function imageStyle(img: SiteImage, extraScale = 1): CSSProperties {
  const scale = (img.zoom ?? 1) * extraScale;
  return {
    objectPosition: img.position,
    ...(scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: img.origin ?? img.position } : {}),
  };
}
