/**
 * Détourage des visuels produits sur fond crème uni (sans IA) :
 * croissance de région depuis les bords (fond lisse) → masque alpha adouci → PNG/WebP transparent.
 * Sert à la scène « le burger se construit » et au hero (le burger passe devant le titre).
 *
 * Usage : node scripts/media/cutout.mjs smash-double le-special …
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const slugs = process.argv.slice(2);
const IN = "public/images/products";
const OUT = "public/images/cutouts";
await mkdir(OUT, { recursive: true });

for (const slug of slugs) {
  const { data, info } = await sharp(`${IN}/${slug}.webp`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

  // Couleur de fond de référence : médiane des bords
  const border = [];
  for (let x = 0; x < W; x += 4) border.push(px(x), px((H - 1) * W + x));
  for (let y = 0; y < H; y += 4) border.push(px(y * W), px(y * W + W - 1));
  const med = [0, 1, 2].map((c) => border.map((p) => p[c]).sort((a, b) => a - b)[border.length >> 1]);

  // Croissance de région : voisin ajouté si proche du pixel courant (gradient lisse) et pas trop loin du fond de référence.
  const bg = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0, tail = 0;
  const seed = (i) => { if (!bg[i] && dist(px(i), med) < 60) { bg[i] = 1; queue[tail++] = i; } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (head < tail) {
    const i = queue[head++];
    const x = i % W, y = (i / W) | 0;
    const c = px(i);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (bg[j]) continue;
      const n = px(j);
      if (dist(n, c) < 14 && dist(n, med) < 95) { bg[j] = 1; queue[tail++] = j; }
    }
  }

  // Masque : 255 = produit. Érosion d'1 px (retire le liseré clair) puis flou léger.
  const mask = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) mask[i] = bg[i] ? 0 : 255;
  const eroded = Buffer.from(mask);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (mask[i] && (!mask[i - 1] || !mask[i + 1] || !mask[i - W] || !mask[i + W])) eroded[i] = 0;
    }
  const soft = await sharp(eroded, { raw: { width: W, height: H, channels: 1 } }).blur(1.1).extractChannel(0).raw().toBuffer();
  if (soft.length !== W * H) throw new Error(`masque inattendu : ${soft.length} ≠ ${W * H}`);

  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = data[i * 3]; rgba[i * 4 + 1] = data[i * 3 + 1]; rgba[i * 4 + 2] = data[i * 3 + 2]; rgba[i * 4 + 3] = soft[i];
  }
  const img = sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 });
  const o = await img.clone().webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(`${OUT}/${slug}.webp`);
  console.log(slug, `${o.width}x${o.height}`, "fond", med.join(","), "pixels fond", tail);
}
