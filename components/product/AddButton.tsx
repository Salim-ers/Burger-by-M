"use client";

import { Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { canQuickAdd, defaultSelections, toSelectedOptions } from "@/lib/product-options";
import { unitPriceFor } from "@/lib/order";
import { flyToCart } from "@/lib/fly-to-cart";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  /** Élément contenant la photo, pour l'animation vers le panier. */
  sourceRef?: React.RefObject<HTMLElement | null>;
  tone?: "dark" | "light";
  /** expand : « + » qui devient « Ajouter » au survol (desktop). */
  variant?: "expand" | "pill";
  className?: string;
}

/**
 * Ajout rapide : les produits sans choix obligatoire s'ajoutent en un tap (options par défaut) ;
 * les autres ouvrent la fiche produit.
 */
export function AddButton({ product, sourceRef, tone = "dark", variant = "expand", className }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openProduct = useUiStore((s) => s.openProduct);
  const orderable = product.available && product.price !== null;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderable) return;
    if (!canQuickAdd(product)) return openProduct(product.id);
    const options = toSelectedOptions(product, defaultSelections(product));
    flyToCart(sourceRef?.current ?? null);
    addItem({ productId: product.id, slug: product.slug, name: product.name, unitPrice: unitPriceFor(product, options), quantity: 1, options, image: product.image });
  };

  const label = !product.available ? "Indisponible" : product.price === null ? "Bientôt" : canQuickAdd(product) ? "Ajouter" : "Composer";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!orderable}
      aria-label={orderable ? `${label} ${product.name}` : `${product.name} : ${label.toLowerCase()}`}
      data-cursor={orderable ? label : undefined}
      className={cn(
        "group/add relative z-10 inline-flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-[0.72rem] font-bold tracking-[0.12em] uppercase transition-all duration-500 ease-out-expo disabled:cursor-not-allowed disabled:opacity-40",
        tone === "dark" ? "bg-cream text-ink hover:bg-rose" : "bg-ink text-cream hover:bg-brown-dark",
        variant === "expand" ? "w-11 hover:w-32 focus-visible:w-32 max-md:w-auto max-md:px-4 max-[360px]:px-3.5" : "px-5",
        className,
      )}
    >
      <Plus className={cn("size-4 shrink-0", variant === "expand" && "md:absolute md:left-3.5 md:transition-transform md:duration-500 group-hover/add:md:rotate-90")} aria-hidden />
      <span
        className={cn(
          "whitespace-nowrap",
          variant === "expand"
            ? "ml-1.5 max-[360px]:sr-only md:ml-0 md:pl-6 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover/add:opacity-100 md:group-focus-visible/add:opacity-100"
            : "ml-2",
        )}
      >
        {label}
      </span>
    </button>
  );
}
