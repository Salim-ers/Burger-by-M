/**
 * BANQUE MÉDIA BURGER BY M — source unique de toutes les images du site.
 *
 * Origine des fichiers :
 *  - products/*.webp     extraits des planches visuelles fournies (assets/sources/planche-*.webp) par
 *                        scripts/media/extract-product-photos.mjs : nom et composition incrustés retirés,
 *                        le texte est rendu en HTML. Un visuel = un produit (aucun réemploi trompeur).
 *  - food/*.webp         photos réelles prises au restaurant (smash, chicken, Frenchy, shakes, plateau, frites).
 *  - restaurant/*.webp   devanture et terrasse réelles (19 avenue de la Gare).
 *  - editorial/*.webp    compositions dérivées (hero 16:9).
 *  - menu/*.webp         cartes imprimées (référence des prix) — non utilisées comme visuels produit.
 *
 * `position` = object-position propre à chaque image. Ne jamais incruster de texte dans une photo.
 */
export interface MediaImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** object-position CSS */
  position?: string;
  /** Photo d'ambiance réelle (restaurant) vs visuel produit de la carte. */
  kind: "product" | "photo" | "place" | "editorial" | "document";
}

const img = (src: string, width: number, height: number, alt: string, kind: MediaImage["kind"], position?: string): MediaImage => ({ src, width, height, alt, kind, position });

export const media = {
  // ---------------- Visuels produits (planches fournies) ----------------
  smashDouble: img("/images/products/smash-double.webp", 1240, 826, "Smash Double : double steak smash, cheddar fondant, salade et sauce smash dans un bun brioché", "product"),
  barbeuc: img("/images/products/barbeuc.webp", 1360, 906, "Barbeuc’ : double steak smash, bacon grillé, cheddar et oignons confits nappés de sauce BBQ", "product"),
  smashTower: img("/images/products/smash-tower.webp", 1390, 926, "Smash Tower : triple steak smash et triple cheddar fondu", "product"),
  leSpecial: img("/images/products/le-special.webp", 1460, 974, "Le Spécial : double steak smash, extra cheddar, oignons crispy et cornichons", "product"),
  chicken: img("/images/products/chicken.webp", 1320, 880, "Chicken : poulet pané croustillant, galette de pomme de terre, cheddar et sauce mayo", "product"),
  jalathai: img("/images/products/jalathai.webp", 1360, 906, "Jalathai : steak, cheddar, oignons rouges, jalapeños et sauce chili thaï", "product"),
  baconCrispy: img("/images/products/bacon-crispy.webp", 1460, 974, "Bacon Crispy : steak, bacon croustillant, cheddar, oignons frits et cornichons", "product"),
  roquefort: img("/images/products/roquefort.webp", 1460, 974, "Roquefort : steak, oignons confits et sauce roquefort", "product"),
  leMontagnard: img("/images/products/le-montagnard.webp", 1546, 1030, "Le Montagnard : steak, bacon, raclette fondue et oignons confits", "product"),
  vegg: img("/images/products/vegg.webp", 1420, 946, "Vegg’ : steak veggie, salade, oignons rouges et sauce smoky", "product"),
  spicyChicken: img("/images/products/spicy-chicken.webp", 1584, 1056, "Spicy Chicken : poulet pané croustillant, galette de pomme de terre, cheddar et mayo spicy", "product"),
  leChevreMiel: img("/images/products/le-chevre-miel.webp", 1760, 1174, "Frenchy Le Chèvre Miel : steak, chèvre fondant et oignons confits en baguette briochée", "product"),
  leHot: img("/images/products/le-hot.webp", 1760, 1174, "Frenchy Le Hot : steak, cheddar, oignons et poivrons confits, sauce barbecue spicy", "product"),
  smashy: img("/images/products/smashy.webp", 1760, 1174, "Frenchy Smashy : triple steak smash, cheddar, bacon et cornichons", "product"),
  leForestier: img("/images/products/le-forestier.webp", 1760, 1174, "Frenchy Le Forestier : filet de poulet crunch et sauce crème champignon", "product"),

  // ---------------- Photos réelles du restaurant ----------------
  realSpecial: img("/images/food/smash-le-special.webp", 720, 1186, "Le Spécial servi au restaurant : cheddar fondu et oignons crispy", "photo", "50% 55%"),
  realSpicyChicken: img("/images/food/classic-spicy-chicken.webp", 720, 1186, "Spicy Chicken servi au restaurant, tenu à la main", "photo", "45% 58%"),
  realLeHot: img("/images/food/frenchy-le-hot.webp", 720, 1186, "Frenchy Le Hot servi au restaurant", "photo", "45% 50%"),
  realForestier: img("/images/food/frenchy-le-forestier.webp", 720, 385, "Frenchy Le Forestier servi au restaurant", "photo", "50% 55%"),
  plateau: img("/images/food/plateau-burgers-frites.webp", 720, 1186, "Plateau Burger By M : burgers, frites maison et frites cheddar jalapeños", "photo", "50% 45%"),
  fritesClassiques: img("/images/food/frites-classiques.webp", 1200, 800, "Frites maison servies au restaurant", "photo", "50% 50%"),
  fritesCheddarOignons: img("/images/food/frites-cheddar-oignons.webp", 1290, 861, "Frites cheddar, oignons frits et jalapeños servies au restaurant", "photo", "50% 50%"),
  milkshakeCaramel: img("/images/food/milkshake-caramel.webp", 1134, 1908, "Milkshake Burger By M au coulis caramel, chantilly et Kinder Bueno White", "photo", "50% 40%"),
  milkshakePistache: img("/images/food/milkshake-pistache.webp", 1146, 1998, "Dubai Shake : crème de pistache, Nutella, pistache concassée et chantilly", "photo", "50% 38%"),
  devanture: img("/images/restaurant/devanture.webp", 1172, 2068, "Devanture de Burger By M, 19 avenue de la Gare à Rantigny : enseigne ronde et terrasse", "place", "50% 40%"),
  terrasse: img("/images/restaurant/terrasse.webp", 1172, 1282, "Terrasse de Burger By M : tables noires et parasol sur gazon", "place", "50% 60%"),

  // ---------------- Éditorial ----------------
  heroSmashDouble: img("/images/editorial/hero-smash-double.webp", 1436, 808, "Smash Double Burger By M : double steak smash et cheddar fondant", "editorial", "50% 50%"),

  // ---------------- Documents ----------------
  carteBurgers: img("/images/menu/carte-burgers.webp", 720, 582, "Carte imprimée Burger By M : burgers, Frenchy’s, suppléments et boissons", "document"),
  carteDesserts: img("/images/menu/carte-desserts.webp", 720, 582, "Carte imprimée Burger By M : desserts et informations pratiques", "document"),
  logo: img("/images/logo/burger-by-m.webp", 532, 532, "Logo Burger By M", "document"),
} satisfies Record<string, MediaImage>;

export type MediaKey = keyof typeof media;

/**
 * Photo de chaque produit de la carte (product.slug → image).
 * Les frites utilisent les photos réelles du plateau : la variante cheddar & bacon n'a pas de photo dédiée
 * (le seed la marque needsFinalProductPhoto).
 */
export const productPhoto = {
  "smash-double": media.smashDouble,
  barbeuc: media.barbeuc,
  "smash-tower": media.smashTower,
  "le-special": media.leSpecial,
  chicken: media.chicken,
  jalathai: media.jalathai,
  "bacon-crispy": media.baconCrispy,
  roquefort: media.roquefort,
  "le-montagnard": media.leMontagnard,
  vegg: media.vegg,
  "spicy-chicken": media.spicyChicken,
  "le-chevre-miel": media.leChevreMiel,
  "le-hot": media.leHot,
  smashy: media.smashy,
  "le-forestier": media.leForestier,
  "frites-classiques": media.fritesClassiques,
  "frites-cheddar": media.fritesCheddarOignons,
  "frites-cheddar-oignons": media.fritesCheddarOignons,
  "dubai-shake": media.milkshakePistache,
  "milkshake-caramel": media.milkshakeCaramel,
} satisfies Record<string, MediaImage>;

export type ProductPhotoKey = keyof typeof productPhoto;

/** Retrouve une image de la banque à partir de son chemin (valeur stockée en base). */
const bySrc = new Map<string, MediaImage>(Object.values(media).map((m) => [m.src, m]));
export function mediaBySrc(src: string | null | undefined): MediaImage | null {
  if (!src) return null;
  return bySrc.get(src) ?? null;
}

/** Galerie : photos réelles + visuels produits, dans un ordre éditorial. */
export const gallery: MediaImage[] = [
  media.realSpecial,
  media.leMontagnard,
  media.devanture,
  media.fritesCheddarOignons,
  media.leHot,
  media.milkshakePistache,
  media.realSpicyChicken,
  media.smashTower,
  media.terrasse,
  media.realLeHot,
  media.barbeuc,
  media.milkshakeCaramel,
  media.plateau,
  media.leForestier,
  media.fritesClassiques,
  media.realForestier,
];
