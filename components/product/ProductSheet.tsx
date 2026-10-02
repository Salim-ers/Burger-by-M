"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ProductVisual } from "./ProductVisual";
import { ProductConfigurator } from "./ProductConfigurator";
import { useUiStore } from "@/stores/ui-store";
import { useProduct } from "@/hooks/use-menu";
import { useModal } from "@/hooks/use-modal";
import { useMediaQuery } from "@/hooks/use-media-query";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fiche produit sans changement de page.
 * Mobile : bottom sheet (~90 % de la hauteur), bouton d'ajout fixe en bas.
 * Desktop : modale deux colonnes (photo / infos).
 */
export function ProductSheet() {
  const state = useUiStore((s) => s.product);
  const close = useUiStore((s) => s.closeProduct);
  const product = useProduct(state?.productId);
  const onClose = useCallback(() => close(), [close]);
  const open = Boolean(state && product);
  const panelRef = useModal(open, onClose);
  const desktop = useMediaQuery("(min-width: 768px)");

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && product && (
        <div className={desktop ? "scheme-light fixed inset-0 z-[80] flex items-center justify-center p-6" : "scheme-light fixed inset-0 z-[80]"}>
          <motion.div className="absolute inset-0 bg-ink/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            initial={desktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: "100%" }}
            animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={desktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: "100%" }}
            transition={{ duration: 0.38, ease: EASE }}
            className={
              desktop
                ? "relative grid h-[min(680px,88dvh)] w-full max-w-[940px] grid-cols-[1fr_1.05fr] overflow-hidden rounded-xl bg-white shadow-sheet"
                : "absolute inset-x-0 bottom-0 flex h-[90dvh] flex-col overflow-hidden rounded-t-xl bg-white shadow-sheet"
            }
          >
            <button type="button" onClick={onClose} aria-label="Fermer" className="absolute top-3 right-3 z-20 grid size-10 place-items-center rounded-full bg-white/95 text-ink shadow-soft transition-colors hover:bg-cream">
              <X className="size-5" aria-hidden />
            </button>
            {desktop ? (
              <>
                <ProductVisual product={product} sizes="470px" className="h-full w-full" />
                <ProductConfigurator key={`${product.id}-${state?.editLineId ?? "new"}`} product={product} editLineId={state?.editLineId} onDone={onClose} />
              </>
            ) : (
              <>
                <ProductConfigurator
                  key={`${product.id}-${state?.editLineId ?? "new"}`}
                  product={product}
                  editLineId={state?.editLineId}
                  onDone={onClose}
                  media={<ProductVisual product={product} sizes="100vw" className="aspect-[16/11] w-full" />}
                />
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
