/**
 * Compositions éditoriales 16:9 sans texte : les VRAIS burgers détourés (public/images/cutouts,
 * version « dark » décontaminée sur fond sombre),
 * alignés sur un fond studio sable avec leurs ombres de contact — plus nets que les planches
 * d'origine (1830 px, texte incrusté). Aucun retouche du produit lui-même.
 * Usage : node scripts/media/lineups.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "public/images/editorial";
await mkdir(OUT, { recursive: true });

const W = 2400;
const H = 1350;

function backdrop(dark) {
  const [a, b, c] = dark ? ["#2a1d15", "#17110d", "#0a0a0a"] : ["#f6efe3", "#ebdfcc", "#dccbb2"];
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="g" cx="50%" cy="42%" r="78%"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${dark ? 0.35 : 0.08}"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect y="${H * 0.62}" width="100%" height="${H * 0.38}" fill="url(#floor)"/>
  </svg>`);
}

function shadow(w, dark) {
  const h = Math.round(w * 0.12);
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h * 3}">
    <defs><radialGradient id="s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2b170c" stop-opacity="${dark ? 0.75 : 0.42}"/><stop offset="0.6" stop-color="#2b170c" stop-opacity="${dark ? 0.3 : 0.16}"/><stop offset="1" stop-color="#2b170c" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="${w / 2}" cy="${h * 1.5}" rx="${w * 0.5}" ry="${h}" fill="url(#s)"/>
  </svg>`))
    .blur(6)
    .png()
    .toBuffer();
}

/**
 * items : [slug, largeur cible (px), centre X (0–1), bas (0–1 de la hauteur)] — du fond vers l'avant.
 */
async function lineup(name, items, { dark = false } = {}) {
  const layers = [];
  for (const [slug, width, cx, bottom] of items) {
    const img = await sharp(`public/images/cutouts/${dark ? "dark/" : ""}${slug}.webp`).resize({ width: Math.round(width), kernel: "lanczos3" }).toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = img.info;
    const left = Math.round(W * cx - w / 2);
    const top = Math.round(H * bottom - h);
    const sh = await shadow(Math.round(w * 0.92), dark);
    const shMeta = await sharp(sh).metadata();
    layers.push({ input: sh, left: Math.round(W * cx - shMeta.width / 2), top: Math.round(H * bottom - shMeta.height / 2 - h * 0.015) });
    layers.push({ input: img.data, left, top });
  }
  await sharp(backdrop(dark))
    .composite(layers)
    .webp({ quality: 86, smartSubsample: true })
    .toFile(`${OUT}/${name}.webp`);
  console.log(`${OUT}/${name}.webp`);
}

// « Généreux par nature » : quatre signatures côte à côte.
await lineup("lineup-signatures", [
  ["le-montagnard", 640, 0.2, 0.78],
  ["smash-tower", 620, 0.41, 0.8],
  ["le-special", 700, 0.62, 0.8],
  ["bacon-crispy", 660, 0.83, 0.78],
]);

// Étape « Choisissez » : la gamme smash.
await lineup("lineup-smash", [
  ["barbeuc", 600, 0.26, 0.74],
  ["smash-tower", 600, 0.74, 0.74],
  ["smash-double", 760, 0.5, 0.86],
]);

// Version sombre pour la scène de construction / transitions.
await lineup("lineup-dark", [
  ["spicy-chicken", 600, 0.22, 0.8],
  ["le-special", 780, 0.5, 0.84],
  ["jalathai", 620, 0.78, 0.8],
], { dark: true });
