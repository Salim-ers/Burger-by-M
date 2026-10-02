"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/** Bouton « + » rond noir : ouvre la fiche (options, quantité) du produit. */
export function AddButton({ product, className, size = "md" }: { product: Product; className?: string; size?: "md" | "lg" }) {
  const openProduct = useUiStore((s) => s.openProduct);
  const disabled = !product.available;
  const noPrice = product.price === null;
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.88 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) openProduct(product.id);
      }}
      disabled={disabled}
      aria-label={disabled ? `${product.name} : indisponible` : noPrice ? `${product.name} : voir le détail` : `Ajouter ${product.name}`}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-ink text-white shadow-[0_6px_14px_-6px_rgb(11_11_11/0.55)] transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-coal disabled:cursor-not-allowed disabled:bg-stone disabled:shadow-none disabled:hover:scale-100",
        size === "lg" ? "size-12" : "size-11",
        noPrice && !disabled && "border border-ink bg-white text-ink shadow-none hover:bg-cream",
        className,
      )}
    >
      <Plus className="size-5" strokeWidth={2.5} aria-hidden />
    </motion.button>
  );
}
