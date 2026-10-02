"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { products as baseProducts } from "@/data/products";
import { categories as baseCategories } from "@/data/categories";
import { useAdminStore, effectivePrepMinutes } from "@/stores/admin-store";
import { mergeCategories, mergeProducts } from "@/lib/menu";

/** Carte publique = données de base + surcharges du back-office (disponibilités, prix, nouveaux produits). */
export function useMenuProducts() {
  const { overrides, custom } = useAdminStore(useShallow((s) => ({ overrides: s.productOverrides, custom: s.customProducts })));
  return useMemo(() => mergeProducts(baseProducts, overrides, custom), [overrides, custom]);
}

export function useMenuCategories() {
  const state = useAdminStore((s) => s.categoryState);
  return useMemo(() => mergeCategories(baseCategories, state), [state]);
}

export function useProduct(id: string | undefined) {
  const all = useMenuProducts();
  return id ? all.find((p) => p.id === id) : undefined;
}

export function useOrdering() {
  return useAdminStore(
    useShallow((s) => ({
      accepting: s.settings.acceptingOrders,
      rush: s.settings.rushMode,
      prepMinutes: effectivePrepMinutes(s.settings),
      interval: s.settings.slotIntervalMinutes,
      maxPerSlot: s.settings.maxOrdersPerSlot,
      hours: s.hours,
    })),
  );
}
