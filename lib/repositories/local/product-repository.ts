import type { ProductRepository } from "../types";
import { useAdminStore } from "@/stores/admin-store";
import { products } from "@/data/products";
import { mergeProducts } from "@/lib/menu";

export const localProductRepository: ProductRepository = {
  async list() {
    const s = useAdminStore.getState();
    return mergeProducts(products, s.productOverrides, s.customProducts);
  },
  async setAvailability(id, available) {
    const p = products.find((x) => x.id === id);
    useAdminStore.getState().setProductAvailability(id, available, p?.name ?? id);
  },
};
