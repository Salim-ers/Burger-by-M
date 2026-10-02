"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ProductConfigurator } from "./ProductConfigurator";
import { ProductVisual } from "./ProductVisual";
import { useProduct } from "@/hooks/use-menu";
import { useUiStore } from "@/stores/ui-store";

export function ProductPageClient({ productId }: { productId: string }) {
  const product = useProduct(productId);
  const router = useRouter();
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const ref = useRef<HTMLDivElement>(null);
  if (!product) return null;
  return (
    <div className="grid-12 gap-y-10">
      <div ref={ref} className="col-span-12 lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
        <ProductVisual product={product} sizes="(min-width: 1024px) 58vw, 100vw" priority quality={90} className="aspect-[4/5] w-full lg:aspect-auto lg:h-[calc(100svh-8rem)]" />
      </div>
      <div className="col-span-12 lg:col-span-5">
        <ProductConfigurator
          product={product}
          layout="page"
          sourceRef={ref}
          onDone={() => {
            setCartOpen(true);
            router.prefetch("/checkout");
          }}
        />
      </div>
    </div>
  );
}
