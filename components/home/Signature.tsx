"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { Price } from "@/components/ui/Price";
import { Arrow } from "@/components/ui/Button";
import { useProduct } from "@/hooks/use-menu";
import { rectOf, useUiStore } from "@/stores/ui-store";
import { shots } from "@/data/images";
import { cn } from "@/lib/utils";

const photo = shots.smashBurger;

/**
 * Étapes : point focal (fx, fy en fraction du cadre visible) et zoom.
 * La photo ne bouge pas de place : c'est la « caméra » qui se déplace d'un ingrédient à l'autre.
 */
const STEPS = [
  { n: 1, title: "Pain", text: "Potatoes bun frais. Doré, moelleux.", fx: 0.5, fy: 0.27, zoom: 1.45 },
  { n: 2, title: "Steak smashé", text: "Double steak, écrasé sur la plaque.", fx: 0.42, fy: 0.8, zoom: 1.6 },
  { n: 3, title: "Cheddar", text: "Extra cheddar. Jusqu’au bord.", fx: 0.62, fy: 0.64, zoom: 1.75 },
  { n: 4, title: "Sauce", text: "Sauce smash. Cornichons.", fx: 0.3, fy: 0.47, zoom: 1.9 },
  { n: 5, title: "Crunch", text: "Oignons crispy. Ça craque.", fx: 0.55, fy: 0.55, zoom: 1.6 },
] as const;

// Progression : intro (0 → 0.1), 5 étapes, sortie (0.9 → 1).
const START = 0.1;
const SPAN = 0.16;
const centers = STEPS.map((_, i) => START + SPAN * i + SPAN / 2);
const stops = [0, START, ...centers, 0.92, 1];
const pick = (fn: (s: (typeof STEPS)[number]) => number, rest: number) => [rest, rest, ...STEPS.map(fn), rest, rest];
const toX = (s: (typeof STEPS)[number]) => (0.5 - s.fx) * s.zoom * 100;
const toY = (s: (typeof STEPS)[number]) => (0.5 - s.fy) * s.zoom * 100;

/** 03 — SIGNATURE BURGER (section sticky, effet cinématique). */
export function Signature() {
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const product = useProduct("le-special");
  const openProduct = useUiStore((s) => s.openProduct);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const scale = useScrollMap(p, stops, pick((s) => s.zoom, 1.04));
  const x = useScrollMap(p, stops, pick(toX, 0).map((v) => `${v}%`));
  const y = useScrollMap(p, stops, pick(toY, 0).map((v) => `${v}%`));

  const [step, setStep] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.floor((v - START) / SPAN);
    setStep(v < START ? -1 : Math.min(STEPS.length - 1, i));
  });

  const current = step >= 0 ? STEPS[step] : null;

  return (
    <section ref={ref} aria-labelledby="signature-title" className={cn("scheme-dark relative bg-ink", !reduce && "h-[480vh] lg:h-[560vh]")}>
        <div className={cn("grid h-[100svh] grid-rows-[46svh_1fr] overflow-hidden lg:grid-cols-12 lg:grid-rows-1", reduce ? "relative" : "sticky top-0")}>
          {/* Photo fixe — la caméra zoome */}
          <div ref={frameRef} className="relative overflow-hidden lg:col-span-7" data-cursor="view">
            <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { scale, x, y }}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" quality={90} className="object-cover" style={{ objectPosition: photo.position }} />
            </motion.div>
            <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,5,5,0.55))]" />
            {/* Repère de visée */}
            <AnimatePresence>
              {current && !reduce && (
                <motion.span
                  key={current.n}
                  aria-hidden
                  className="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 border border-bone/70"
                  initial={{ opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="kicker absolute -top-6 left-0 text-bone/80">{String(current.n).padStart(2, "0")}</span>
                </motion.span>
              )}
            </AnimatePresence>
            <p className="kicker absolute top-24 left-4 text-bone/70 md:left-8">03 — Signature</p>
          </div>

          {/* Informations qui évoluent */}
          <div className="flex min-h-0 flex-col justify-between px-4 pt-5 pb-24 md:px-8 md:pb-10 lg:col-span-5 lg:px-12 lg:pt-28 lg:pb-12">
            <div>
              <h2 id="signature-title" className="font-display text-d3 leading-[0.86]">
                Le Spécial<span className="text-cheddar">.</span>
              </h2>
              <p className="mt-3 hidden max-w-sm text-sm text-bone/60 md:block lg:text-base">Double steak smash, extra cheddar, oignons crispy, cornichons, salade, sauce smash.</p>
            </div>

            {reduce ? (
              <ol className="space-y-2">
                {STEPS.map((s) => (
                  <li key={s.n} className="flex items-baseline gap-4 border-b border-bone/15 pb-2">
                    <span className="font-display text-2xl text-cheddar">{String(s.n).padStart(2, "0")}</span>
                    <span className="font-display text-2xl">{s.title}</span>
                    <span className="text-sm text-bone/60">{s.text}</span>
                  </li>
                ))}
              </ol>
            ) : (
            <div className="flex items-end gap-5 lg:block">
              <RollingNumber value={current?.n ?? 0} className="font-display text-[clamp(4rem,9vw,8.5rem)] text-cheddar" />
              <div className="min-h-[5.5rem] min-w-0 flex-1 lg:min-h-[7.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current?.n ?? 0}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="font-display text-[clamp(2.6rem,5vw,5.2rem)] leading-[0.9]">{current?.title ?? "Décortiqué"}</p>
                    <p className="mt-2 text-sm text-bone/70 lg:text-lg">{current?.text ?? "Cinq couches. Une seule bouchée."}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            )}

            <div>
              <ol className={cn("flex gap-1.5", reduce && "hidden")} aria-label="Étapes">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="flex-1">
                    <span className={cn("block h-0.5 transition-colors duration-300", i <= step ? "bg-cheddar" : "bg-bone/15")} />
                    <span className={cn("kicker mt-2 hidden transition-colors md:block", i === step ? "text-bone" : "text-bone/35")}>{s.title}</span>
                  </li>
                ))}
              </ol>
              {product && (
                <button
                  type="button"
                  data-cursor="add"
                  onClick={() => openProduct(product.id, undefined, rectOf(frameRef.current))}
                  className="group/btn mt-4 flex h-14 w-full items-center justify-between rounded-sm bg-cheddar px-5 font-display text-xl text-ink uppercase transition-colors hover:bg-bone"
                >
                  <span>
                    Ajouter — <Price cents={product.price} />
                  </span>
                  <Arrow />
                </button>
              )}
            </div>
          </div>
        </div>
    </section>
  );
}
