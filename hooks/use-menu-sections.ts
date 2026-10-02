"use client";

import { useMemo } from "react";
import { useMenuCategories, useMenuProducts } from "./use-menu";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export interface MenuSection {
  category: Category;
  items: Product[];
}

/** Carte regroupée par catégorie active (catégories vides masquées). */
export function useMenuSections() {
  const products = useMenuProducts();
  const categories = useMenuCategories();
  return useMemo(
    () =>
      categories
        .filter((c) => c.active)
        .map((category) => ({ category, items: products.filter((p) => p.category === category.id) }))
        .filter((s) => s.items.length > 0),
    [categories, products],
  );
}
