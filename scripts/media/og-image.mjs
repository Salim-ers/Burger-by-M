/**
 * Image de partage (OpenGraph / réseaux sociaux) 1200×630 : vrai Smash Double détouré sur fond sable,
 * logo officiel. Aucun texte incrusté (le titre est fourni par les métadonnées de la page).
 * Usage : node scripts/media/og-image.mjs
 */
import sharp from "sharp";

const W = 1200, H = 630;
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><radialGradient id="g" cx="50%" cy="46%" r="75%"><stop offset="0" stop-color="#f1e9dc"/><stop offset="0.55" stop-color="#e9e0d1"/><stop offset="1" stop-color="#ddd0bb"/></radialGradient>
  <radialGradient id="s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3c2314" stop-opacity="0.32"/><stop offset="1" stop-color="#3c2314" stop-opacity="0"/></radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <ellipse cx="${W / 2}" cy="${H - 70}" rx="420" ry="34" fill="url(#s)"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#c7a66a" stroke-opacity="0.55" stroke-width="1"/>
</svg>`);

const burger = await sharp("public/images/cutouts/smash-double.webp").resize({ width: 740 }).toBuffer();
const meta = await sharp(burger).metadata();
const logo = await sharp("public/images/logo/burger-by-m.png").resize(118, 118).toBuffer();

await sharp(bg)
  .composite([
    { input: burger, left: Math.round((W - meta.width) / 2), top: Math.round(H - meta.height - 58) },
    { input: logo, left: 70, top: 70 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile("public/images/social/og-burger-by-m.jpg");
console.log("public/images/social/og-burger-by-m.jpg");
