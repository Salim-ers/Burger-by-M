"use client";

import { useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useUi } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useModal } from "@/hooks/use-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { gsap, reducedMotion } from "@/components/motion/gsap";
import { ProductConfigurator } from "./ProductConfigurator";
import { ProductImage } from "./ProductImage";
import { useToast } from "@/components/site/Toast";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Fiche produit immersive : écran scindé sur desktop (grande photo à gauche, personnalisation à droite),
 * bottom sheet pleine hauteur sur mobile. À l'ajout, la photo se contracte légèrement vers le panier.
 */
export function ProductSheet() {
  const sheet = useUi((s) => s.sheet);
  const close = useUi((s) => s.closeProduct);
  const lines = useCart((s) => s.lines);
  const { products } = useSite();
  const toast = useToast();
  const product = sheet ? products.get(sheet.productId) : undefined;
  const editing = sheet?.editKey ? lines.find((l) => l.key === sheet.editKey) : undefined;
  const onClose = useCallback(() => close(), [close]);
  const open = Boolean(product);
  const ref = useModal(open, onClose);
  const wide = useMediaQuery("(min-width: 900px)");
  const photoRef = useRef<HTMLDivElement>(null);

  const done = useCallback(
    (added: boolean) => {
      if (!added) return onClose();
      if (product) toast(`${product.name} ajouté au panier`);
      const photo = photoRef.current;
      const cart = document.querySelector<HTMLElement>("[data-cart-target]");
      if (!photo || !cart || reducedMotion()) return onClose();
      // La photo se contracte légèrement en direction du panier (pas de « panier volant »).
      const a = photo.getBoundingClientRect();
      const b = cart.getBoundingClientRect();
      gsap.to(photo, { x: (b.left + b.width / 2 - (a.left + a.width / 2)) * 0.06, y: (b.top + b.height / 2 - (a.top + a.height / 2)) * 0.06, scale: 0.93, autoAlpha: 0.35, duration: 0.32, ease: "power2.in", onComplete: onClose });
    },
    [onClose, product, toast],
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {product && (
        <div className="on-light fixed inset-0 z-[80]">
          <motion.div className="absolute inset-0 bg-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            initial={wide ? { opacity: 0, x: "6%" } : { y: "100%" }}
            animate={wide ? { opacity: 1, x: 0 } : { y: 0 }}
            exit={wide ? { opacity: 0, x: "6%" } : { y: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            className={wide ? "absolute inset-y-0 right-0 grid w-[min(1280px,94vw)] grid-cols-[1.15fr_1fr] bg-bg shadow-sheet" : "absolute inset-x-0 top-[4dvh] bottom-0 flex flex-col overflow-hidden rounded-t-[8px] bg-bg shadow-sheet"}
          >
            <button type="button" onClick={onClose} aria-label="Fermer la fiche" className="t-label absolute top-3 right-3 z-20 h-11 bg-bg/90 px-4 text-fg backdrop-blur transition-colors hover:bg-fg hover:text-bg">
              Fermer ✕
            </button>
            {wide ? (
              <>
                <motion.div ref={photoRef} className="relative h-full overflow-hidden bg-sand" initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.8, ease: [0.77, 0, 0.18, 1] }}>
                  <ProductImage image={product.image} name={product.name} sizes="60vw" className="absolute inset-0" priority />
                </motion.div>
                <ProductConfigurator key={`${product.id}-${editing?.key ?? "new"}`} product={product} editing={editing} onDone={done} />
              </>
            ) : (
              <ProductConfigurator
                key={`${product.id}-${editing?.key ?? "new"}`}
                product={product}
                editing={editing}
                onDone={done}
                media={
                  <div ref={photoRef}>
                    <ProductImage image={product.image} name={product.name} sizes="100vw" className="aspect-[16/10] w-full" priority />
                  </div>
                }
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
