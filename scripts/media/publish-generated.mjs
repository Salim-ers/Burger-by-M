/**
 * Publication web des visuels retenus (assets/generated/manifest.json) — à lancer à la main.
 *
 *  - Accueil : variantes AVIF + WebP pré-calculées par largeur (public/images/cinema/), servies directement
 *    par le CDN : le visuel du hero ne dépend pas de l'optimiseur d'images au premier affichage.
 *    Génère aussi src/data/cinema-assets.ts (dimensions, largeurs, aperçu flou).
 *  - Carte : un WebP de haute qualité par recette (public/images/products/), décliné par next/image.
 *
 * Aucun agrandissement : une largeur supérieure à celle du fichier source n'est jamais produite.
 *
 *   npm run media:publish
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const manifest = JSON.parse(readFileSync("assets/generated/manifest.json", "utf8"));

const CINEMA = {
  "hero-desktop": [1920, 2560, 3840],
  "hero-mobile": [640, 828, 1170, 1620, 2160],
  plancha: [640, 960, 1280, 1800],
  "plancha-desktop": [1920, 2560, 3840],
  "table-desktop": [1920, 2560, 3840],
  "table-mobile": [640, 828, 1170, 1620],
};

const MENU = ["frites-classiques", "frites-cheddar", "frites-cheddar-oignons", "frites-cheddar-bacon", "milkshake-dubai", "milkshake-bueno-bomb", "milkshake-a-composer"];

function selected(id) {
  const file = manifest.assets[id]?.selected;
  if (!file) throw new Error(`${id} : aucune version retenue.`);
  if (file.includes("_drafts")) console.warn(`[${id}] ATTENTION : la version retenue est un brouillon.`);
  return file;
}

const out = "public/images/cinema";
mkdirSync(out, { recursive: true });

const data = {};
for (const [id, widths] of Object.entries(CINEMA)) {
  const source = selected(id);
  const { width, height } = await sharp(source).metadata();
  const kept = widths.filter((w) => w <= width);
  for (const w of kept) {
    // Légère accentuation après réduction, couleurs en pleine résolution (4:4:4) : le mur blanc reste propre.
    // Hero et plancha en portrait : écrans très denses, où une compression plus forte ne se voit pas et accélère l'affichage.
    const resized = sharp(source).resize({ width: w, kernel: "lanczos3" }).sharpen({ sigma: 0.55 });
    const lighter = id === "hero-mobile" || id === "plancha";
    await resized.clone().avif({ quality: lighter ? 62 : 76, effort: 5, chromaSubsampling: "4:4:4" }).toFile(join(out, `${id}-${w}.avif`));
    await resized.clone().webp({ quality: lighter ? 78 : 88, effort: 5, smartSubsample: true }).toFile(join(out, `${id}-${w}.webp`));
  }
  const lqip = await sharp(source).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  data[id] = { width, height, widths: kept, lqip: `data:image/webp;base64,${lqip.toString("base64")}` };
  console.log(`[${id}] ${kept.join(", ")}`);
}

writeFileSync(
  "src/data/cinema-assets.ts",
  `/** Généré par scripts/media/publish-generated.mjs — ne pas modifier à la main. */\nexport const cinemaAssets = ${JSON.stringify(data, null, 2)} as const;\n`,
);

for (const id of MENU) {
  const source = selected(id);
  const info = await sharp(source).resize({ width: 2000, withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality: 84, effort: 6 }).toFile(`public/images/products/${id}.webp`);
  console.log(`[${id}] ${info.width}x${info.height} ${Math.round(info.size / 1024)} Ko`);
}
