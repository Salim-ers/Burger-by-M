/**
 * Extrait les photos produits des planches visuelles fournies (assets/sources/planche-*.webp).
 *
 * Les planches contiennent le nom et la composition incrustés : on ne garde que la photo
 * (le texte est rendu en HTML sur le site). Les fragments de titre qui débordent dans un cadre
 * sont effacés en reconstituant le fond crème ligne par ligne.
 *
 * Sortie : public/images/products/<slug>.webp (3:2, fond crème prolongé en fondu) +
 *          public/images/editorial/hero-smash-double.webp (16:9 pour le hero).
 *
 * Usage : node scripts/media/extract-product-photos.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets/sources";
const OUT = "public/images/products";
const UPSCALE = 2; // visuels source ~600 px : lanczos x2 pour les écrans haute densité

/**
 * [slug, planche, boîte {x,y,w,h}, zones à effacer].
 * Zone : rectangle (coordonnées absolues) + `ref` = patch de fond propre voisin servant de couleur de remplissage.
 */
const SPECS = [
  ["smash-double", "planche-burger-smash", { x: 128, y: 6, w: 620, h: 404 }, [
    { x: 672, y: 6, w: 76, h: 106, ref: { x: 690, y: 115, w: 30, h: 25 } },
    { x: 722, y: 112, w: 26, h: 112, ref: { x: 690, y: 115, w: 30, h: 25 } },
  ]],
  ["barbeuc", "planche-burger-smash", { x: 1065, y: 6, w: 680, h: 404 }, [
    { x: 1065, y: 6, w: 93, h: 106, ref: { x: 1110, y: 115, w: 40, h: 25 } },
    { x: 1065, y: 112, w: 39, h: 93, ref: { x: 1110, y: 115, w: 40, h: 25 } },
  ]],
  ["smash-tower", "planche-burger-smash", { x: 115, y: 487, w: 695, h: 442 }, []],
  ["le-special", "planche-burger-smash", { x: 1025, y: 512, w: 730, h: 414 }, []],
  ["chicken", "planche-burger-classic", { x: 130, y: 4, w: 660, h: 404 }, [
    { x: 686, y: 4, w: 104, h: 100, ref: { x: 700, y: 110, w: 40, h: 30 }, gap: "left" },
    { x: 740, y: 104, w: 50, h: 158, ref: { x: 700, y: 110, w: 40, h: 30 } },
  ]],
  ["jalathai", "planche-burger-classic", { x: 1060, y: 6, w: 680, h: 406 }, [
    { x: 1060, y: 6, w: 90, h: 96, ref: { x: 1105, y: 104, w: 30, h: 12 }, gap: "right" },
    { x: 1060, y: 102, w: 40, h: 113, ref: { x: 1105, y: 104, w: 30, h: 12 } },
  ]],
  ["bacon-crispy", "planche-burger-classic", { x: 100, y: 505, w: 730, h: 411 }, []],
  ["roquefort", "planche-burger-classic", { x: 1020, y: 514, w: 730, h: 400 }, []],
  ["le-montagnard", "planche-classic-signatures", { x: 0, y: 285, w: 612, h: 515 }, [
    { x: 585, y: 285, w: 27, h: 30, ref: { x: 540, y: 286, w: 40, h: 14 } },
  ]],
  ["vegg", "planche-classic-signatures", { x: 625, y: 335, w: 575, h: 473 }, []],
  ["spicy-chicken", "planche-classic-signatures", { x: 1225, y: 272, w: 602, h: 528 }, []],
  ["le-chevre-miel", "planche-frenchys", { x: 20, y: 145, w: 880, h: 316 }, [
    { x: 804, y: 145, w: 96, h: 51, ref: { x: 770, y: 146, w: 30, h: 24 } },
    { x: 840, y: 196, w: 60, h: 32, ref: { x: 770, y: 146, w: 30, h: 24 } },
  ]],
  ["le-hot", "planche-frenchys", { x: 925, y: 140, w: 880, h: 322 }, [
    { x: 925, y: 140, w: 210, h: 32, ref: { x: 1150, y: 145, w: 50, h: 20 } },
    { x: 925, y: 168, w: 115, h: 47, ref: { x: 935, y: 214, w: 50, h: 18 } },
  ]],
  ["smashy", "planche-frenchys", { x: 20, y: 560, w: 880, h: 351 }, []],
  ["le-forestier", "planche-frenchys", { x: 925, y: 565, w: 880, h: 349 }, []],
];

async function load(name) {
  const { data, info } = await sharp(`${SRC}/${name}.webp`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
}

/** Moyenne RGB d'une petite fenêtre (bornée à l'image). */
function mean(img, x0, y0, w, h) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = Math.max(0, y0); y < Math.min(img.H, y0 + h); y++)
    for (let x = Math.max(0, x0); x < Math.min(img.W, x0 + w); x++) {
      const i = (y * img.W + x) * img.C;
      r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
    }
  return n ? [r / n, g / n, b / n] : null;
}

/** Remplace un segment de ligne [from, to[ par la couleur de fond. */
function eraseRun(img, fill, from, to, y) {
  for (let x = from; x < to; x++) {
    const i = (y * img.W + x) * img.C;
    for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(fill[c]);
  }
}

/**
 * Efface le texte d'une zone : seuls les pixels qui s'écartent du fond (lettres + halo d'anticrénelage,
 * masque dilaté de 2 px) sont remplacés par la couleur du patch de référence, avec un léger grain.
 * Les pixels de fond restent intacts : aucune trace de rectangle.
 */
function erase(img, z) {
  const fill = mean(img, z.ref.x, z.ref.y, z.ref.w, z.ref.h);
  const isBg = (x, y) => {
    const i = (y * img.W + x) * img.C;
    return Math.abs(img.data[i] - fill[0]) + Math.abs(img.data[i + 1] - fill[1]) + Math.abs(img.data[i + 2] - fill[2]) <= 22;
  };
  // gap : la lettre touche presque le produit ; ligne par ligne, on étend la zone jusqu'à l'interstice de fond.
  if (z.gap) {
    for (let y = z.y; y < Math.min(img.H, z.y + z.h); y++) {
      if (z.gap === "left") {
        for (let x = z.x; x > z.x - 10; x--) if (isBg(x, y) && isBg(x - 1, y)) { eraseRun(img, fill, x, z.x, y); break; }
      } else {
        const edge = z.x + z.w;
        for (let x = edge; x < edge + 10; x++) if (isBg(x, y) && isBg(x + 1, y)) { eraseRun(img, fill, edge, x + 1, y); break; }
      }
    }
  }
  const x1 = Math.min(img.W, z.x + z.w), y1 = Math.min(img.H, z.y + z.h);
  const w = x1 - z.x, h = y1 - z.y;
  const mark = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((z.y + y) * img.W + z.x + x) * img.C;
      const d = Math.abs(img.data[i] - fill[0]) + Math.abs(img.data[i + 1] - fill[1]) + Math.abs(img.data[i + 2] - fill[2]);
      if (d > 22) mark[y * w + x] = 1;
    }
  const R = 2;
  const grown = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!mark[y * w + x]) continue;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const yy = y + dy, xx = x + dx;
          if (yy >= 0 && yy < h && xx >= 0 && xx < w) grown[yy * w + xx] = 1;
        }
    }
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 2.4;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!grown[y * w + x]) continue;
      const i = ((z.y + y) * img.W + z.x + x) * img.C;
      const n = rand();
      for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(fill[c] + n);
    }
}

/** Couleur moyenne du pourtour d'une boîte : sert de fond au canevas élargi. */
function borderColor(img, box) {
  const s = [mean(img, box.x, box.y, box.w, 6), mean(img, box.x, box.y + box.h - 6, box.w, 6), mean(img, box.x, box.y, 6, box.h), mean(img, box.x + box.w - 6, box.y, 6, box.h)];
  return [0, 1, 2].map((c) => Math.round(s.reduce((n, v) => n + v[c], 0) / s.length));
}

/** Masque alpha : opaque au centre, fondu sur `f` px vers les bords à prolonger. */
function featherMask(w, h, f, sides) {
  const buf = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let a = 1;
      if (sides.top) a = Math.min(a, y / f);
      if (sides.bottom) a = Math.min(a, (h - 1 - y) / f);
      if (sides.left) a = Math.min(a, x / f);
      if (sides.right) a = Math.min(a, (w - 1 - x) / f);
      buf[y * w + x] = Math.round(Math.max(0, Math.min(1, a)) * 255);
    }
  return buf;
}

/** Place la découpe sur un canevas au ratio voulu, fond crème prolongé en fondu. */
async function compose(img, box, ratio, bg) {
  const crop = await sharp(img.data, { raw: { width: img.W, height: img.H, channels: img.C } })
    .extract({ left: box.x, top: box.y, width: box.w, height: box.h })
    .raw()
    .toBuffer();
  let W = box.w, H = box.h;
  if (W / H > ratio) H = Math.round(W / ratio);
  else W = Math.round(H * ratio);
  const padX = W > box.w, padY = H > box.h;
  const mask = featherMask(box.w, box.h, 28, { top: padY, bottom: padY, left: padX, right: padX });
  const rgba = Buffer.alloc(box.w * box.h * 4);
  for (let p = 0; p < box.w * box.h; p++) {
    rgba[p * 4] = crop[p * 3]; rgba[p * 4 + 1] = crop[p * 3 + 1]; rgba[p * 4 + 2] = crop[p * 3 + 2]; rgba[p * 4 + 3] = mask[p];
  }
  const layer = await sharp(rgba, { raw: { width: box.w, height: box.h, channels: 4 } }).png().toBuffer();
  return sharp({ create: { width: W, height: H, channels: 3, background: { r: bg[0], g: bg[1], b: bg[2] } } })
    .composite([{ input: layer, left: Math.round((W - box.w) / 2), top: Math.round((H - box.h) / 2) }])
    .png()
    .toBuffer();
}

await mkdir(OUT, { recursive: true });
await mkdir("public/images/editorial", { recursive: true });
const cache = new Map();
for (const [slug, sheet, box, zones] of SPECS) {
  if (!cache.has(sheet)) cache.set(sheet, await load(sheet));
  const base = cache.get(sheet);
  const img = { ...base, data: Buffer.from(base.data) };
  zones.forEach((z) => erase(img, z));
  const bg = borderColor(img, box);
  const png = await compose(img, box, 3 / 2, bg);
  const meta = await sharp(png).metadata();
  await sharp(png)
    .resize({ width: meta.width * UPSCALE, kernel: "lanczos3" })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 84, effort: 6 })
    .toFile(`${OUT}/${slug}.webp`);
  console.log(slug, `${meta.width * UPSCALE}x${meta.height * UPSCALE}`, "bg", bg.join(","));
  if (slug === "smash-double") {
    const hero = await compose(img, box, 16 / 9, bg);
    const hm = await sharp(hero).metadata();
    await sharp(hero).resize({ width: hm.width * UPSCALE, kernel: "lanczos3" }).sharpen({ sigma: 0.6 }).webp({ quality: 86, effort: 6 }).toFile("public/images/editorial/hero-smash-double.webp");
    console.log("hero", `${hm.width * UPSCALE}x${hm.height * UPSCALE}`);
  }
}
