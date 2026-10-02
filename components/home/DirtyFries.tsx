"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { ButtonLink } from "@/components/ui/Button";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

const fries = images.loadedFries;

const WORDS = [
  { word: "Crispy", className: "top-[27%] left-[2%] md:top-[16%] md:left-[6%]", outline: false, from: -60 },
  { word: "Saucy", className: "top-[34%] right-[2%] md:right-[5%]", outline: true, from: 60 },
  { word: "Loaded", className: "bottom-[20%] left-[4%] md:left-[12%]", outline: true, from: -60 },
];

/**
 * 07 — DIRTY FRIES. Fond qui vire au cheddar à l'entrée, typo géante derrière la photo,
 * mots qui gravitent autour. Crop serré des vraies frites cheddar / oignons frits.
 */
export function DirtyFries() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const wipe = useScrollMap(scrollYProgress, [0.02, 0.24], [1, 0]);
  const photoY = useScrollMap(scrollYProgress, [0, 1], ["12%", "-12%"]);
  const rotate = useScrollMap(scrollYProgress, [0.1, 0.6], [-6, 2]);
  const dirtyX = useScrollMap(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const friesX = useScrollMap(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section ref={ref} aria-labelledby="fries-title" className="scheme-light relative isolate overflow-hidden bg-cheddar text-ink">
      {/* Transition de fond : le graphite se retire vers le haut, le cheddar prend toute la place. */}
      {!reduce && <motion.div aria-hidden className="absolute inset-0 -z-10 origin-top bg-graphite" style={{ scaleY: wipe }} />}
      <div aria-hidden className="absolute inset-0 -z-20 bg-cheddar" />
      <div className="shell flex items-center justify-between pt-10 md:pt-14">
        <span className="kicker">07 — Sides</span>
        <span className="kicker text-ink/60">Get dirty.</span>
      </div>

      <div className="relative mt-6 min-h-[118vw] md:min-h-[min(105vh,980px)]">
        {/* Typo géante derrière la photo */}
        <h2 id="fries-title" className="pointer-events-none absolute inset-x-0 top-[4%] z-0 flex flex-col items-center font-display text-[clamp(5.5rem,27vw,26rem)] leading-[0.8] select-none">
          <motion.span style={reduce ? undefined : { x: dirtyX }}>Dirty</motion.span>
          <motion.span className="mt-[38vw] md:mt-[18vw]" style={reduce ? undefined : { x: friesX }}>
            Fries.
          </motion.span>
        </h2>

        {/* Photo au centre, devant la typo */}
        <motion.div
          className="absolute top-[22%] left-1/2 z-10 aspect-[4/5] w-[62vw] -translate-x-1/2 md:top-[14%] md:w-[min(30vw,460px)]"
          style={reduce ? undefined : { y: photoY, rotate }}
        >
          <div className="relative h-full w-full overflow-hidden border-[6px] border-ink bg-ink shadow-float" data-cursor="view">
            <Image src={fries.src} alt={fries.alt} fill sizes="(min-width: 768px) 30vw, 62vw" quality={90} className="object-cover" style={{ objectPosition: fries.position, transform: `scale(${fries.zoom})`, transformOrigin: fries.origin }} />
          </div>
        </motion.div>

        {/* Mots autour */}
        {WORDS.map((w, i) => (
          <motion.span
            key={w.word}
            aria-hidden
            className={cn("absolute z-20 font-display text-[clamp(2.4rem,7vw,7rem)] leading-none", w.className, w.outline && "text-outline")}
            initial={{ opacity: 0, x: w.from }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
            transition={{ duration: 0.7, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
          >
            {w.word}
          </motion.span>
        ))}
      </div>

      <div className="shell relative z-20 pb-16 md:pb-24">
        <div className="grid-12 gap-y-8 border-t-2 border-ink pt-6">
          <div className="col-span-12 md:col-span-5">
            <p className="kicker text-ink/60">Frites</p>
            <p className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.05]">Classiques · Cheddar · Cheddar & oignons frits · Cheddar & bacon</p>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p className="kicker text-ink/60">Extras — ×3 4,00 € · ×6 6,00 €</p>
            <p className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.05]">Mozza-sticks · Nugget’s · Camembert crispy · Chili cheese</p>
          </div>
          <div className="col-span-12 flex items-end md:col-span-3 md:justify-end">
            <ButtonLink href="/menu#sides" variant="dark" size="lg" arrow>
              Voir les sides
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
