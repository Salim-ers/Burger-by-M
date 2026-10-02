"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/types/product";
import { getImage, imageStyle } from "@/data/images";
import { ProductPoster } from "@/components/product/ProductVisual";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";

interface Props {
  product: Product | null;
  /** Photo affichée tant qu'aucun produit n'est survolé (photo d'un produit réel de la catégorie). */
  cover?: { product: Product } | null;
  className?: string;
}

/**
 * Grande photo contextuelle (desktop) : la photo du produit survolé y apparaît par un masque
 * vertical rapide. Produit sans photo → affiche typographique (jamais la photo d'un autre plat).
 */
export const PreviewPane = forwardRef<HTMLDivElement, Props>(function PreviewPane({ product, cover, className }, ref) {
  const shown = product ?? cover?.product ?? null;
  const image = shown ? getImage(shown.image) : null;
  const key = shown ? `${shown.id}` : "empty";

  return (
    <figure className={cn("relative", className)}>
      <div ref={ref} data-cursor="view" className="relative aspect-[4/5] overflow-hidden bg-ink">
        <AnimatePresence initial={false}>
          <motion.div
            key={key}
            className="absolute inset-0"
            style={{ zIndex: 1 }}
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, zIndex: 0, transition: { zIndex: { duration: 0 }, opacity: { delay: 0.42, duration: 0.01 } } }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div className="absolute inset-0" initial={{ scale: 1.14 }} animate={{ scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              {image ? (
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 34vw, 1px" quality={85} className="object-cover" style={imageStyle(image)} />
              ) : shown ? (
                <ProductPoster name={shown.name} className="absolute inset-0" />
              ) : null}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      {shown && (
        <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-t border-fg/20 pt-3">
          <span className="kicker text-fg/55">{image ? "Photo" : "Visuel"} — {shown.name}</span>
          <span className="font-display text-xl">
            <Price cents={shown.price} />
          </span>
        </figcaption>
      )}
    </figure>
  );
});
