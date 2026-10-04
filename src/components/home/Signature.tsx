"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { LineReveal, useReduce, useScrollMap } from "@/components/motion";
import { media, type MediaImage } from "@/data/media";

// Colonnes plus hautes que la zone visible : le défilement parallèle ne laisse jamais de vide.
const COLUMNS: MediaImage[][] = [
  [media.realSpecial, media.fritesCheddarOignons, media.devanture, media.milkshakeCaramel, media.realLeHot],
  [media.milkshakePistache, media.realLeHot, media.plateau, media.realSpecial, media.terrasse],
  [media.terrasse, media.realSpicyChicken, media.milkshakeCaramel, media.plateau, media.fritesCheddarOignons],
];

/** Section noire : très peu de texte, de vraies photos du restaurant qui défilent en colonnes. */
export function Signature() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y0 = useScrollMap(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const y1 = useScrollMap(scrollYProgress, [0, 1], ["-30%", "-4%"]);
  const y2 = useScrollMap(scrollYProgress, [0, 1], ["-6%", "-38%"]);
  const ys = [y0, y1, y2];

  return (
    <section ref={ref} aria-labelledby="signature-title" className="on-dark relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="shell grid gap-16 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          <p className="kicker text-brass">Signature</p>
          <LineReveal id="signature-title" as="h2" lines={["Pas besoin", <span key="b" className="italic">d’en faire trop.</span>]} className="display-2 mt-6" />
          <LineReveal as="p" delay={0.2} lines={["Quand le burger", "parle pour nous."]} className="mt-10 font-serif text-[1.9rem] leading-[1.05] text-fg/60 md:text-[2.4rem]" />
        </div>
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden md:col-span-7 md:h-[110vh]">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-ink to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-ink to-transparent" />
          <div className="grid h-full grid-cols-3 gap-3 md:gap-5">
            {COLUMNS.map((col, ci) => (
              <motion.div key={ci} style={reduce ? undefined : { y: ys[ci] }} className="flex flex-col gap-3 md:gap-5">
                {col.map((img) => (
                  <div key={img.src} className="relative aspect-[3/4] w-full overflow-hidden bg-ink-soft">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 20vw, 33vw" className="object-cover" style={img.position ? { objectPosition: img.position } : undefined} />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
