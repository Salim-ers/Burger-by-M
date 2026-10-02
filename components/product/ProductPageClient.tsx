"use client";

import { useRouter } from "next/navigation";
import { ProductConfigurator } from "./ProductConfigurator";
import { useProduct } from "@/hooks/use-menu";
import { useUiStore } from "@/stores/ui-store";

export function ProductPageClient({ productId }: { productId: string }) {
  const product = useProduct(productId);
  const router = useRouter();
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  if (!product) return null;
  return (
    <ProductConfigurator
      product={product}
      layout="page"
      onDone={() => {
        setCartOpen(true);
        router.prefetch("/checkout");
      }}
    />
  );
}
