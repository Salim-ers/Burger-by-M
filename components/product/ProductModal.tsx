"use client";

import { useCallback } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ProductConfigurator } from "./ProductConfigurator";
import { useUiStore } from "@/stores/ui-store";
import { useProduct } from "@/hooks/use-menu";

export function ProductModal() {
  const state = useUiStore((s) => s.product);
  const close = useUiStore((s) => s.closeProduct);
  const product = useProduct(state?.productId);
  const onClose = useCallback(() => close(), [close]);

  return (
    <Dialog open={Boolean(state && product)} onClose={onClose} labelledBy="product-title" placement="center" className="md:h-[min(760px,88dvh)]">
      {product && <ProductConfigurator key={`${product.id}-${state?.editLineId ?? "new"}`} product={product} editLineId={state?.editLineId} onDone={onClose} />}
    </Dialog>
  );
}
