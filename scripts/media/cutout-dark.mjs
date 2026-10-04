/**
 * Détourages pour fonds SOMBRES (hero, construction du burger) : même détourage que cutout.mjs,
 * mais bord resserré et « décontaminé » — la teinte sable du fond d'origine, invisible sur fond clair,
 * formerait un liseré sur fond noir. Les pixels du bord reprennent la couleur de l'intérieur du produit.
 * Le produit lui-même n'est pas retouché.
 *
 * Usage : node scripts/media/cutout-dark.mjs [slug …]   (sans argument : tous les produits)
 */
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";

const IN = "public/images/products";
const OUT = "public/images/cutouts/dark";
await mkdir(OUT, { recursive: true });
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : (await readdir(IN)).filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, ""));

for (const slug of slugs) {
  const { data, info } = await sharp(`${IN}/${slug}.webp`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

  // 1. Fond par croissance de région depuis les bords (identique à cutout.mjs).
  const border = [];
  for (let x = 0; x < W; x += 4) border.push(px(x), px((H - 1) * W + x));
  for (let y = 0; y < H; y += 4) border.push(px(y * W), px(y * W + W - 1));
  const med = [0, 1, 2].map((c) => border.map((p) => p[c]).sort((a, b) => a - b)[border.length >> 1]);
  // Ombre portée d'origine : même teinte que le fond, plus sombre, peu saturée (bas de l'image uniquement).
  const medSum = med[0] + med[1] + med[2];
  const isShadow = (c, y) => {
    if (y < H * 0.55) return false;
    const sum = c[0] + c[1] + c[2];
    if (sum < medSum * 0.45 || sum > medSum * 1.02) return false;
    return [0, 1, 2].every((k) => Math.abs(c[k] / sum - med[k] / medSum) < 0.022);
  };
  const bg = new Uint8Array(N);
  const queue = new Int32Array(N);
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
      if ((dist(n, c) < 14 && dist(n, med) < 95) || (dist(n, c) < 22 && isShadow(n, ny))) { bg[j] = 1; queue[tail++] = j; }
    }
  }

  // 1 bis. Fragments isolés (miettes, reliquats d'ombre) : seuls les gros morceaux du produit sont gardés.
  {
    const label = new Int32Array(N).fill(-1);
    const sizes = [];
    for (let s0 = 0; s0 < N; s0++) {
      if (bg[s0] || label[s0] !== -1) continue;
      const id = sizes.length;
      let size = 0;
      head = 0; tail = 0;
      queue[tail++] = s0; label[s0] = id;
      while (head < tail) {
        const i = queue[head++];
        size++;
        const x = i % W, y = (i / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const j = ny * W + nx;
          if (!bg[j] && label[j] === -1) { label[j] = id; queue[tail++] = j; }
        }
      }
      sizes.push(size);
    }
    const keep = Math.max(...sizes) * 0.004;
    for (let i = 0; i < N; i++) if (!bg[i] && sizes[label[i]] < keep) bg[i] = 1;
  }

  // 2. Distance au fond (BFS multi-sources, en pixels, plafonnée à 8).
  const d = new Uint8Array(N).fill(255);
  head = 0; tail = 0;
  for (let i = 0; i < N; i++) if (bg[i]) { d[i] = 0; queue[tail++] = i; }
  while (head < tail) {
    const i = queue[head++];
    if (d[i] >= 8) continue;
    const x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (d[j] > d[i] + 1) { d[j] = d[i] + 1; queue[tail++] = j; }
    }
  }

  // 3. Décontamination : les pixels à ≤ 4 px du fond prennent la couleur moyenne de l'intérieur proche (≥ 5 px).
  const rgb = Buffer.from(data);
  const R = 5;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (d[i] === 0 || d[i] > 4) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = Math.max(0, y - R); yy <= Math.min(H - 1, y + R); yy++)
        for (let xx = Math.max(0, x - R); xx <= Math.min(W - 1, x + R); xx++) {
          const j = yy * W + xx;
          if (d[j] >= 5) { r += data[j * 3]; g += data[j * 3 + 1]; b += data[j * 3 + 2]; n++; }
        }
      if (n) { rgb[i * 3] = r / n; rgb[i * 3 + 1] = g / n; rgb[i * 3 + 2] = b / n; }
    }

  // 4. Alpha : bord resserré de 2 px puis adouci.
  const mask = Buffer.alloc(N);
  for (let i = 0; i < N; i++) mask[i] = d[i] >= 3 ? 255 : 0;
  const soft = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).blur(0.9).extractChannel(0).raw().toBuffer();
  if (soft.length !== N) throw new Error(`masque inattendu : ${soft.length} ≠ ${N}`);

  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2]; rgba[i * 4 + 3] = soft[i];
  }
  const o = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).webp({ quality: 88, alphaQuality: 92, effort: 6 }).toFile(`${OUT}/${slug}.webp`);
  console.log(slug, `${o.width}x${o.height}`);
}
