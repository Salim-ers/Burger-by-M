"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useModal } from "@/hooks/use-modal";
import type { MediaImage } from "@/data/media";

/** Visionneuse plein écran : flèches clavier, glisser sur mobile, focus piégé, Échap. */
export function Lightbox({ images, index, onClose, onIndex }: { images: MediaImage[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null;
  const close = useCallback(() => onClose(), [onClose]);
  const ref = useModal(open, close);
  const go = useCallback((d: number) => index !== null && onIndex((index + d + images.length) % images.length), [index, onIndex, images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (typeof document === "undefined") return null;
  const img = index !== null ? images[index] : null;
  return createPortal(
    <AnimatePresence>
      {img && (
        <motion.div ref={ref} role="dialog" aria-modal="true" aria-label="Visionneuse de photos" className="on-dark fixed inset-0 z-[160] flex flex-col bg-ink/96" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            <p className="t-label text-sub tabular-nums">
              {String(index! + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={close} className="t-label h-11 px-3 text-cream hover:text-cheddar">
              Fermer ✕
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={img.src}
                className="relative h-full w-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1);
                  if (info.offset.x > 80) go(-1);
                }}
              >
                <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="t-m absolute left-3 hidden size-12 place-items-center text-cream hover:text-cheddar md:grid">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="t-m absolute right-3 hidden size-12 place-items-center text-cream hover:text-cheddar md:grid">
              →
            </button>
          </div>
          <p className="mx-auto max-w-2xl px-6 py-5 text-center text-sm text-cream/70">{img.alt}</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
