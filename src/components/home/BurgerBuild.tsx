"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, type MotionValue } from "framer-motion";
import { useReduce, useScrollMap } from "@/components/motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const SRC = "/images/cutouts/smash-double.webp";
const RATIO = 764 / 1144;

/**
 * Le vrai Smash Double, découpé en bandes horizontales de la MÊME photo (aucun faux burger 3D) :
 * au défilement, chaque couche descend se poser sur la précédente jusqu'au burger assemblé.
 * Bandes en % de la hauteur, du bas vers le haut.
 */
const LAYERS = [
  { name: "Le pain", detail: "Potatoes bun frais, toasté", top: 84, bottom: 100 },
  { name: "Le steak smashé", detail: "Écrasé sur la plaque, saisi, croustillant", top: 73, bottom: 84 },
  { name: "Le cheddar", detail: "Il fond sur la viande encore chaude", top: 64, bottom: 73 },
  { name: "Le second steak", detail: "Parce qu’un seul ne suffit pas", top: 55, bottom: 64 },
  { name: "Encore du cheddar", detail: "Généreux, jusqu’au bord", top: 46, bottom: 55 },
  { name: "La sauce smash", detail: "La signature de la maison", top: 37, bottom: 46 },
  { name: "Le pain du dessus", detail: "Et le burger est prêt", top: 0, bottom: 37 },
] as const;

const START = 0.06;
const SPAN = 0.105;

export function BurgerBuild() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const wide = useMediaQuery("(min-width: 768px)", true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.35 });
  const [scene, setScene] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => setScene(v < START ? -1 : Math.min(LAYERS.length - 1, Math.floor((v - START) / SPAN))));
  const outroOpacity = useScrollMap(p, [0.8, 0.9], [0, 1]);
  const outroY = useScrollMap(p, [0.8, 0.9], [30, 0]);
  const shadow = useScrollMap(p, [START, START + SPAN], [0, 1]);

  if (reduce) return <StaticBuild />;

  return (
    <section ref={ref} id="construction" aria-labelledby="build-title" className="on-light relative bg-ivory" style={{ height: wide ? "420vh" : "300vh" }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="shell flex items-center justify-between pt-24 md:pt-28">
          <p className="kicker text-ink/55">La construction</p>
          <p className="kicker text-ink/55 tabular-nums">
            {String(Math.max(0, scene + 1)).padStart(2, "0")} / {String(LAYERS.length).padStart(2, "0")}
          </p>
        </div>

        <div className="shell relative grid flex-1 items-center gap-6 md:grid-cols-12">
          {/* Scènes */}
          <ol className="relative z-10 order-2 md:order-1 md:col-span-4" aria-label="Les étapes">
            {LAYERS.map((l, i) => (
              <li key={l.name} className={cn("transition-all duration-500 ease-out-expo", i === scene ? "opacity-100" : "hidden opacity-30 md:block", i > scene && "md:opacity-15")}>
                <p className={cn("flex items-baseline gap-4 py-1.5", i === scene ? "text-ink" : "text-ink/60")}>
                  <span className="kicker w-7 shrink-0 tabular-nums text-brass-deep">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("font-serif leading-tight", i === scene ? "text-[1.9rem] md:text-[2.2rem]" : "text-[1.3rem]")}>{l.name}</span>
                </p>
                {i === scene && <p className="pl-11 text-sm text-ink/60">{l.detail}</p>}
              </li>
            ))}
          </ol>

          {/* Scène : bandes de la même photo */}
          <div className="relative order-1 mx-auto w-full max-w-[720px] md:order-2 md:col-span-8">
            <div className="relative w-full" style={{ aspectRatio: `${1 / RATIO}` }}>
              <motion.div aria-hidden style={{ opacity: shadow }} className="absolute -bottom-[4%] left-1/2 h-[10%] w-[78%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(60,35,20,0.35),transparent)]" />
              {LAYERS.map((l, i) => (
                <Layer key={l.name} index={i} top={l.top} bottom={l.bottom} progress={p} wide={wide} />
              ))}
              <span className="sr-only">Smash Double Burger By M assemblé couche par couche.</span>
            </div>
          </div>
        </div>

        <motion.div style={{ opacity: outroOpacity, y: outroY }} className="shell pb-10 text-center md:pb-14">
          <h2 id="build-title" className="display-3">
            Tout est dans <span className="italic">les détails.</span>
          </h2>
          <Link href="/menu" className="kicker mt-5 inline-flex items-center gap-3 border-b border-ink/30 pb-1 transition-colors hover:border-ink">
            Découvrir la carte →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Layer({ index, top, bottom, progress, wide }: { index: number; top: number; bottom: number; progress: MotionValue<number>; wide: boolean }) {
  const s = START + index * SPAN;
  const e = s + SPAN * 1.15;
  const drop = wide ? -420 : -240;
  const y = useScrollMap(progress, [s, e], [drop, 0]);
  const opacity = useScrollMap(progress, [s, s + SPAN * 0.45], [0, 1]);
  const rotate = useScrollMap(progress, [s, e], [index % 2 ? 2.5 : -2.5, 0]);
  return (
    <motion.div className="absolute inset-0 will-change-transform" style={{ y, opacity, rotate, clipPath: `inset(${top}% 0% ${100 - bottom}% 0%)` }}>
      <Image src={SRC} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-contain" preload={index === 0} />
    </motion.div>
  );
}

/** Mouvement réduit : le burger assemblé et la liste des étapes. */
function StaticBuild() {
  return (
    <section id="construction" aria-labelledby="build-title" className="on-light bg-ivory py-24">
      <div className="shell grid items-center gap-10 md:grid-cols-12">
        <ol className="md:col-span-4">
          {LAYERS.map((l, i) => (
            <li key={l.name} className="flex items-baseline gap-4 border-b border-rule py-3">
              <span className="kicker w-7 text-brass-deep">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-serif text-xl">{l.name}</span>
            </li>
          ))}
        </ol>
        <div className="md:col-span-8">
          <Image src={SRC} alt="Smash Double Burger By M" width={1144} height={764} sizes="(min-width: 768px) 60vw, 100vw" className="h-auto w-full" />
          <h2 id="build-title" className="display-3 mt-8 text-center">
            Tout est dans <span className="italic">les détails.</span>
          </h2>
          <p className="mt-4 text-center">
            <Link href="/menu" className="kicker border-b border-ink/30 pb-1">
              Découvrir la carte →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
