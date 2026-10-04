/**
 * Icônes de l'application cuisine (PWA /admin) générées depuis le logo officiel.
 * Usage : node scripts/media/pwa-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const LOGO = "public/images/logo/burger-by-m.png";
const OUT = "public/icons";
const INK = { r: 0, g: 0, b: 0, alpha: 1 }; // même noir que le disque du logo

await mkdir(OUT, { recursive: true });

/** Logo centré sur fond noir ; `ratio` = part du carré occupée par le logo. */
async function icon(size, ratio, file) {
  const inner = Math.round(size * ratio);
  const logo = await sharp(LOGO).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${file}`);
  console.log(`${OUT}/${file}`);
}

await icon(192, 0.9, "icon-192.png");
await icon(512, 0.9, "icon-512.png");
// Zone de sécurité « maskable » : le logo tient dans le cercle central (80 %).
await icon(512, 0.66, "maskable-512.png");
await icon(180, 0.86, "apple-touch-icon.png");
await icon(96, 0.9, "badge-96.png");
