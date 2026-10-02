"use client";

import { Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { rectOf, useUiStore } from "@/stores/ui-store";
import { canQuickAdd, defaultSelections, toSelectedOptions } from "@/lib/product-options";
import { unitPriceFor } from "@/lib/order";
import { flyToCart } from "@/lib/fly-to-cart";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  /** Élément contenant la photo, pour l'animation vers le panier / l'ouverture de la fiche. */
  sourceRef?: React.RefObject<HTMLElement | null>;
  /** square : « + » discret de la carte ; wide : bouton « Ajouter » pleine largeur. */
  variant?: "square" | "wide";
  className?: string;
}

/**
 * Ajout rapide : les produits sans choix obligatoire s'ajoutent en un tap (options par défaut) ;
 * les autres ouvrent la fiche produit.
 */
export function AddButton({ product, sourceRef, variant = "square", className }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openProduct = useUiStore((s) => s.openProduct);
  const orderable = product.available && product.price !== null;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderable) return;
    if (!canQuickAdd(product)) return openProduct(product.id, undefined, rectOf(sourceRef?.current));
    const options = toSelectedOptions(product, defaultSelections(product));
    flyToCart(sourceRef?.current ?? (e.currentTarget as HTMLElement));
    addItem({ productId: product.id, slug: product.slug, name: product.name, unitPrice: unitPriceFor(product, options), quantity: 1, options, image: product.image });
  };

  const label = !product.available ? "Indisponible" : product.price === null ? "Bientôt" : canQuickAdd(product) ? "Ajouter" : "Composer";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!orderable}
      aria-label={orderable ? `${label} ${product.name}` : `${product.name} : ${label.toLowerCase()}`}
      data-cursor={orderable ? "add" : undefined}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center justify-center rounded-sm border border-fg/30 text-fg transition-colors duration-200 hover:border-cheddar hover:bg-cheddar hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-fg/30 disabled:hover:bg-transparent disabled:hover:text-fg",
        variant === "square" ? "size-11" : "h-12 gap-2 px-5 font-display text-[1.05rem] uppercase",
        className,
      )}
    >
      <Plus className="size-4.5" strokeWidth={2.5} aria-hidden />
      {variant === "wide" && <span>{label}</span>}
    </button>
  );
}
