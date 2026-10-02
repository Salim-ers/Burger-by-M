"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductVisual } from "./ProductVisual";
import { ProductConfigurator } from "./ProductConfigurator";
import { useUiStore, type OriginRect } from "@/stores/ui-store";
import { useProduct } from "@/hooks/use-menu";
import { useModal } from "@/hooks/use-modal";

const EASE = [0.76, 0, 0.24, 1] as const;

/** Zone finale de la photo : moitié gauche sur desktop, bandeau haut sur mobile. */
function targetRect(): OriginRect {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w >= 1024) return { x: 0, y: 0, w: Math.round(w * 0.56), h };
  if (w >= 768) return { x: 0, y: 0, w: Math.round(w * 0.5), h };
  return { x: 0, y: 0, w, h: Math.round(h * 0.42) };
}

/**
 * Fiche produit plein écran (fond noir) : photo immense à gauche, infos à droite.
 * À l'ouverture, la photo s'étend depuis la vignette cliquée (origine mémorisée dans le store).
 */
export function ProductSheet() {
  const state = useUiStore((s) => s.product);
  const close = useUiStore((s) => s.closeProduct);
  const product = useProduct(state?.productId);
  const onClose = useCallback(() => close(), [close]);
  const open = Boolean(state && product);
  const panelRef = useModal(open, onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && product && (
        <motion.div
          key="sheet"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-title"
          className="scheme-dark fixed inset-0 z-[80] overflow-hidden text-bone"
          initial={{ backgroundColor: "rgba(5,5,5,0)" }}
          animate={{ backgroundColor: "rgba(5,5,5,1)" }}
          exit={{ opacity: 0, transition: { duration: 0.22 } }}
          transition={{ duration: 0.3 }}
        >
          <SheetBody key={`${product.id}-${state?.editLineId ?? "new"}`} product={product} editLineId={state?.editLineId} origin={state?.origin ?? null} onDone={onClose} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche produit"
            className="absolute top-3 right-3 z-20 flex h-11 items-center gap-2 rounded-sm bg-ink/70 px-3 font-display text-base tracking-[0.04em] text-bone uppercase transition-colors hover:bg-bone hover:text-ink md:top-5 md:right-5"
          >
            Fermer <X className="size-4" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SheetBody({ product, editLineId, origin, onDone }: { product: Product; editLineId?: string; origin: OriginRect | null; onDone: () => void }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<OriginRect>(() => targetRect());
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onResize = () => setTarget(targetRect());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const from = origin ?? { x: target.x, y: target.y + target.h * 0.06, w: target.w, h: target.h * 0.88 };

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 grid grid-rows-[42svh_1fr] md:grid-cols-[50%_50%] md:grid-rows-1 lg:grid-cols-[56%_44%]">
        <div aria-hidden />
        <motion.div
          className="relative min-h-0 border-graphite md:border-l"
          initial={{ opacity: 0, x: origin ? 40 : 0, y: origin ? 0 : 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductConfigurator product={product} editLineId={editLineId} onDone={onDone} sourceRef={imageRef} />
        </motion.div>
      </div>

      {/* Photo : part du rectangle de la vignette cliquée et s'étend jusqu'à sa place. */}
      <motion.div
        ref={imageRef}
        className="pointer-events-none absolute overflow-hidden"
        initial={{ left: from.x, top: from.y, width: from.w, height: from.h, opacity: origin ? 1 : 0 }}
        animate={{ left: target.x, top: target.y, width: target.w, height: target.h, opacity: 1 }}
        transition={done ? { duration: 0 } : { duration: 0.6, ease: EASE }}
        onAnimationComplete={() => setDone(true)}
      >
        <motion.div className="absolute inset-0" initial={{ scale: origin ? 1 : 1.12 }} animate={{ scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <ProductVisual product={product} sizes="(min-width: 1024px) 56vw, (min-width: 768px) 50vw, 100vw" quality={90} className="absolute inset-0" />
        </motion.div>
      </motion.div>
    </div>
  );
}
