import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { ProductOverride } from "@/stores/admin-store";

export function mergeProducts(base: Product[], overrides: Record<string, ProductOverride>, custom: Product[] = []): Product[] {
  return [
    ...base.map((p) => {
      const o = overrides[p.id];
      if (!o) return p;
      const { badge: _badge, ...rest } = o;
      void _badge;
      return { ...p, ...rest };
    }),
    ...custom,
  ];
}

export function mergeCategories(base: Category[], state: Record<string, { active: boolean; order: number }>): Category[] {
  return base
    .map((c) => ({ ...c, active: state[c.id]?.active ?? c.active, order: state[c.id]?.order ?? c.order }))
    .sort((a, b) => a.order - b.order);
}

export function isOrderable(p: Product) {
  return p.available && p.price !== null;
}
