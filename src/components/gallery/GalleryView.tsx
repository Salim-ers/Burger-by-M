"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "@/components/motion";
import { gallery } from "@/data/media";
import { useModal } from "@/hooks/use-modal";

/** Galerie éditoriale : colonnes en maçonnerie, visionneuse plein écran (clavier, glisser). */
export function GalleryView() {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <section className="on-light bg-ivory pt-28 pb-12 md:pt-40 md:pb-16">
        <div className="shell flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker text-brass-deep">Galerie</p>
            <h1 className="display-1 mt-6">
              <span className="reveal-line" style={{ "--i": 0 } as React.CSSProperties}>
                <span>Vu de</span>
              </span>
              <span className="reveal-line" style={{ "--i": 1 } as React.CSSProperties}>
                <span className="italic">près.</span>
              </span>
            </h1>
          </div>
          <p className="max-w-xs text-sm text-sub">Photos prises au restaurant et visuels de la carte. Touchez une image pour l’agrandir.</p>
        </div>
      </section>
      <section aria-label="Photos" className="on-light bg-ivory pb-28">
        <div className="shell columns-2 gap-3 md:columns-3 md:gap-5 [&>*]:mb-3 md:[&>*]:mb-5">
          {gallery.map((img, i) => (
            <Reveal key={img.src} delay={(i % 3) * 0.06} className="break-inside-avoid">
              <button type="button" onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden bg-sand" aria-label={`Agrandir : ${img.alt}`}>
                <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 768px) 31vw, 48vw" loading={i < 3 ? "eager" : undefined} className="h-auto w-full transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]" />
              </button>
            </Reveal>
          ))}
        </div>
      </section>
      <Lightbox index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}

function Lightbox({ index, onClose, onIndex }: { index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null;
  const close = useCallback(() => onClose(), [onClose]);
  const ref = useModal(open, close);
  const go = useCallback((d: number) => index !== null && onIndex((index + d + gallery.length) % gallery.length), [index, onIndex]);

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
  const img = index !== null ? gallery[index] : null;
  return createPortal(
    <AnimatePresence>
      {img && (
        <motion.div ref={ref} role="dialog" aria-modal="true" aria-label="Visionneuse" className="on-dark fixed inset-0 z-[90] flex flex-col bg-ink/96" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center justify-between px-4 py-3 text-fg md:px-8">
            <p className="kicker text-sub tabular-nums">
              {String(index! + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={close} aria-label="Fermer" className="grid size-11 place-items-center rounded-full hover:bg-fg/10">
              <X className="size-5" aria-hidden strokeWidth={1.5} />
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
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-2 hidden size-12 place-items-center rounded-full text-fg hover:bg-fg/10 md:grid">
              <ChevronLeft className="size-6" aria-hidden strokeWidth={1.25} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-2 hidden size-12 place-items-center rounded-full text-fg hover:bg-fg/10 md:grid">
              <ChevronRight className="size-6" aria-hidden strokeWidth={1.25} />
            </button>
          </div>
          <p className="mx-auto max-w-2xl px-6 py-5 text-center text-sm text-fg/70">{img.alt}</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
