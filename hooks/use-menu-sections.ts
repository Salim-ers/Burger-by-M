"use client";

import { useMemo } from "react";
import { useMenuCategories, useMenuProducts } from "./use-menu";
import { menuGroups } from "@/data/categories";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export interface MenuSection {
  category: Category;
  /** Ancre du groupe (première catégorie du groupe uniquement). */
  anchor?: string;
  items: Product[];
}

/** Carte regroupée par catégorie active, avec les ancres de la sous-navigation. */
export function useMenuSections() {
  const products = useMenuProducts();
  const categories = useMenuCategories();
  return useMemo(() => {
    const seen = new Set<string>();
    const sections: MenuSection[] = categories
      .filter((c) => c.active)
      .map((c) => {
        const anchor = seen.has(c.group) ? undefined : c.group;
        seen.add(c.group);
        return { category: c, anchor, items: products.filter((p) => p.category === c.id) };
      })
      .filter((s) => s.items.length > 0);
    const groups = menuGroups.filter((g) => sections.some((s) => s.category.group === g.id));
    return { sections, groups, products };
  }, [categories, products]);
}
