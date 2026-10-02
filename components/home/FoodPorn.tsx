"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { images } from "@/data/images";
import { useUiStore } from "@/stores/ui-store";
import { useMediaQuery } from "@/hooks/use-media-query";

/** Section immersive : la photo et les deux lignes de texte glissent à des vitesses différentes. */
export function FoodPorn() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const openProduct = useUiStore((s) => s.openProduct);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const topY = useTransform(scrollYProgress, [0, 1], [90, -60]);
  const bottomY = useTransform(scrollYProgress, [0, 1], [-40, 70]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1]);
  const still = reduce || !desktop;

  return (
    <section ref={ref} aria-labelledby="coule-title" className="relative overflow-hidden bg-ink py-28 md:py-44">
      <div className="container-site relative">
        <h2 id="coule-title" className="sr-only">Attention, ça coule.</h2>
        <div aria-hidden className="font-display text-mega font-medium uppercase">
          <motion.span style={still ? undefined : { y: topY }} className="relative z-10 block">
            Attention.
          </motion.span>
          <span className="relative z-0 -mt-[0.32em] block md:ml-[12%]">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-xs md:aspect-[720/385]">
              <motion.span style={still ? undefined : { scale }} className="absolute inset-0 block">
                <Image src={images.forestier.src} alt="" fill sizes="(min-width: 768px) 80vw, 100vw" quality={90} className="object-cover object-[50%_60%]" />
              </motion.span>
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/30" />
            </span>
          </span>
          <motion.span style={still ? undefined : { y: bottomY }} className="relative z-10 -mt-[0.42em] block text-right text-rose">
            Ça coule.
          </motion.span>
        </div>

        <div className="mt-10 flex flex-col gap-6 md:ml-[12%] md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-[0.98rem] leading-relaxed text-cream/70">
            <span className="font-semibold text-cream">Le Forestier.</span> Filet de poulet crunch, oignons confits, nappé de sauce crème champignons. Dans une baguette briochée.
          </p>
          <button type="button" onClick={() => openProduct("le-forestier")} className="self-start border-b border-cream/30 pb-1 text-sm font-semibold hover:border-rose md:self-auto">
            Découvrir le Forestier
          </button>
        </div>
      </div>
    </section>
  );
}
