/**
 * Retouche d'un visuel généré : remplace la fausse impression du dos du cuisinier par le vrai logo Burger By M.
 * Les modèles d'image déforment les petits textes : le logo est donc posé à la main, sous la tresse
 * (dans la colonne de la tresse, les pixels chauds de l'image d'origine restent au premier plan).
 *
 *   node scripts/media/retouch-logo.mjs <source> <sortie> <centreX> <centreY> <rayon> <tresseX> <demi-largeur>
 *
 * Exécution manuelle uniquement. La source n'est pas modifiée.
 */
import sharp from "sharp";

const [source, output, cx, cy, radius, hairX, hairHalf] = process.argv.slice(2);
if (!source || !output || !cx || !cy || !radius || !hairX || !hairHalf) {
  console.error("Usage : node scripts/media/retouch-logo.mjs <source> <sortie> <centreX> <centreY> <rayon> <tresseX> <demi-largeur>");
  process.exit(1);
}
const r = Number(radius);
const size = r * 2;
const left = Number(cx) - r;
const top = Number(cy) - r;

// Logo légèrement adouci et atténué pour s'intégrer à la lumière et au grain de la photo.
const logo = await sharp("public/images/logo/burger-by-m.png").resize(size, size).blur(0.5).ensureAlpha().raw().toBuffer();
const area = await sharp(source).extract({ left, top, width: size, height: size }).ensureAlpha().raw().toBuffer();

const out = Buffer.from(area);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const [ar, ag, ab] = [area[i], area[i + 1], area[i + 2]];
    // Cheveux : teinte chaude, dans la colonne de la tresse. Ils passent devant le logo.
    if (ar - ab > 22 && ar > 45 && Math.abs(left + x - Number(hairX)) <= Number(hairHalf)) continue;
    const dist = Math.hypot(x - r + 0.5, y - r + 0.5);
    if (dist > r) continue;
    const alpha = (logo[i + 3] / 255) * 0.92;
    // Dans le disque : le fond noir du logo efface l'ancienne impression.
    for (let c = 0; c < 3; c++) out[i + c] = Math.round(logo[i + c] * 0.78 * alpha + (dist < r - 2 ? 22 : area[i + c]) * (1 - alpha));
  }
}

const patch = await sharp(out, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();
await sharp(source).composite([{ input: patch, left, top }]).webp({ quality: 96, effort: 5 }).toFile(output);
console.log(output);
