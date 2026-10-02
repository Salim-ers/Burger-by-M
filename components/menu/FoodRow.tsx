"use client";

import { useRef } from "react";
import { Flame, Leaf } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductVisual } from "@/components/product/ProductVisual";
import { AddButton } from "@/components/product/AddButton";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/** Ligne de carte éditoriale (façon carte imprimée), pas une « card » e-commerce. */
export function FoodRow({ product }: { product: Product }) {
  const openProduct = useUiStore((s) => s.openProduct);
  const ref = useRef<HTMLDivElement>(null);
  const unavailable = !product.available;

  return (
    <article className="group relative grid grid-cols-[84px_1fr] items-center gap-x-4 gap-y-3 border-b border-cream/10 py-6 sm:grid-cols-[112px_1fr_auto] md:grid-cols-[132px_1fr_auto_auto] md:gap-x-8 md:py-7">
      <div ref={ref} className="relative row-span-2 aspect-square overflow-hidden rounded-xs sm:row-span-1">
        <ProductVisual product={product} sizes="132px" className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-105" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className={cn("font-display text-[1.65rem] leading-[0.95] tracking-[-0.01em] uppercase transition-transform duration-500 ease-out-expo md:text-[2.3rem] md:group-hover:translate-x-2", unavailable && "text-cream/50")}>
            {product.name}
          </h3>
          {product.popular && <Badge tone="rose">Best seller</Badge>}
          {product.spicy && (
            <span className="text-cheddar" title="Épicé">
              <Flame className="size-4" aria-label="Épicé" />
            </span>
          )}
          {product.vegetarian && (
            <span className="text-success" title="Végétarien">
              <Leaf className="size-4" aria-label="Végétarien" />
            </span>
          )}
          {unavailable && <Badge tone="danger">Indisponible</Badge>}
        </div>
        {product.description && <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-cream/60">{product.description}</p>}
      </div>

      <div className="col-start-2 flex items-center justify-between gap-4 sm:col-start-3 sm:row-start-1 md:contents">
        <span className={cn("font-display text-2xl tabular-nums transition-transform duration-500 ease-out-expo md:text-3xl md:group-hover:-translate-x-2", unavailable && "opacity-50")}>
          <Price cents={product.price} />
        </span>
        <AddButton product={product} sourceRef={ref} />
      </div>

      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-offset-[-2px]"
        aria-label={`Voir le détail : ${product.name}`}
        data-cursor="Voir"
      />
    </article>
  );
}
