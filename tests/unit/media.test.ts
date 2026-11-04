import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productPhoto } from "@/data/media";
import { cinemaAssets } from "@/data/cinema-assets";
import { MODIFIER_GROUPS, PRODUCTS } from "@/db/seed/menu-data";

const FRITES = ["frites-classiques", "frites-cheddar", "frites-cheddar-oignons-frits", "frites-cheddar-bacon"];

describe("visuels des frites", () => {
  const products = PRODUCTS.filter((p) => FRITES.includes(p.slug));

  it("chaque recette a son propre visuel, jamais celui d'une autre", () => {
    const sources = products.map((p) => productPhoto[p.photo!].src);
    expect(sources).toHaveLength(4);
    expect(new Set(sources).size).toBe(4);
  });

  it("les fichiers existent et les produits restent signalés « photo d'illustration »", () => {
    for (const p of products) {
      expect(existsSync(`public${productPhoto[p.photo!].src}`)).toBe(true);
      expect(p.needsFinalProductPhoto).toBe(true);
      expect(productPhoto[p.photo!].alt).toContain("illustration");
    }
  });

  it("la migration vise les mêmes fichiers que la banque média", () => {
    const sql = readFileSync("src/db/migrations/0003_visuels_frites.sql", "utf8");
    for (const p of products) {
      expect(sql).toContain(`('${p.slug}', '${productPhoto[p.photo!].src}'`);
    }
  });
});

describe("visuels des milkshakes", () => {
  it("chaque milkshake a son visuel, signalé comme illustration", () => {
    const products = PRODUCTS.filter((p) => ["dubai-shake", "bueno-bomb", "milkshake-a-composer"].includes(p.slug));
    expect(products).toHaveLength(3);
    expect(new Set(products.map((p) => productPhoto[p.photo!].src)).size).toBe(3);
    for (const p of products) {
      expect(existsSync(`public${productPhoto[p.photo!].src}`)).toBe(true);
      expect(p.needsFinalProductPhoto).toBe(true);
    }
  });
});

describe("commandes simulées de la démonstration", () => {
  it("ne citent que des produits et des boissons de la carte", () => {
    const source = readFileSync("src/features/demo/sample.ts", "utf8");
    const slugs = [...source.matchAll(/slug: "([a-z-]+)"/g)].map((m) => m[1]!);
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(PRODUCTS.find((p) => p.slug === slug)?.priceCents ?? null, slug).not.toBeNull();
    const drinks = MODIFIER_GROUPS.find((g) => g.key === "boisson-menu")!.modifiers.map((m) => m.name);
    for (const m of source.matchAll(/menu: "([^"]+)"/g)) expect(drinks).toContain(m[1]);
  });
});

describe("visuels de l'accueil", () => {
  it("toutes les variantes référencées existent, en AVIF et en WebP", () => {
    for (const [id, asset] of Object.entries(cinemaAssets)) {
      for (const w of asset.widths) {
        expect(existsSync(`public/images/cinema/${id}-${w}.avif`)).toBe(true);
        expect(existsSync(`public/images/cinema/${id}-${w}.webp`)).toBe(true);
      }
    }
  });
});
