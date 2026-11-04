import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productPhoto } from "@/data/media";
import { cinemaAssets } from "@/data/cinema-assets";
import { PRODUCTS } from "@/db/seed/menu-data";

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
