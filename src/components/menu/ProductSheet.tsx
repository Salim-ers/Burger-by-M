"use client";

import { useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCart, useUi } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useModal } from "@/hooks/use-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ProductConfigurator } from "./ProductConfigurator";
import { ProductImage } from "./ProductImage";
import { useToast } from "@/components/site/Toast";

/** Fiche produit : bottom sheet sur mobile, fenêtre deux colonnes sur desktop (grande photo à gauche). */
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {product && (
        <div className={wide ? "on-light fixed inset-0 z-[80] flex items-center justify-center p-6" : "on-light fixed inset-0 z-[80]"}>
          <motion.div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            initial={wide ? { opacity: 0, y: 24, scale: 0.985 } : { y: "100%" }}
            animate={wide ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={wide ? { opacity: 0, y: 24, scale: 0.985 } : { y: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={
              wide
                ? "relative grid h-[min(760px,90dvh)] w-full max-w-[1120px] grid-cols-[1.1fr_1fr] overflow-hidden rounded-sm bg-bg shadow-sheet"
                : "absolute inset-x-0 bottom-0 flex h-[90dvh] flex-col overflow-hidden rounded-t-lg bg-bg shadow-sheet"
            }
          >
            <button type="button" onClick={onClose} aria-label="Fermer la fiche" className="absolute top-3 right-3 z-20 grid size-11 place-items-center rounded-full bg-bg/85 text-fg backdrop-blur transition-colors hover:bg-fg hover:text-bg">
              <X className="size-5" aria-hidden strokeWidth={1.5} />
            </button>
            {wide ? (
              <>
                <motion.div className="relative h-full" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
                  <ProductImage image={product.image} name={product.name} sizes="620px" className="absolute inset-0" priority />
                </motion.div>
                <ProductConfigurator
                  key={`${product.id}-${editing?.key ?? "new"}`}
                  product={product}
                  editing={editing}
                  onDone={() => {
                    onClose();
                    if (!editing) toast(`${product.name} ajouté au panier`);
                  }}
                />
              </>
            ) : (
              <ProductConfigurator
                key={`${product.id}-${editing?.key ?? "new"}`}
                product={product}
                editing={editing}
                onDone={() => {
                  onClose();
                  if (!editing) toast(`${product.name} ajouté au panier`);
                }}
                media={<ProductImage image={product.image} name={product.name} sizes="100vw" className="aspect-[4/3] w-full" priority />}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
