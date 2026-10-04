"use client";

import { useMemo, useRef } from "react";
import { interpolate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** prefers-reduced-motion sans écart d'hydratation (false au rendu serveur et au premier rendu client). */
export function useReduce() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated && Boolean(reduce);
}

/**
 * Interpolation calculée en JS à chaque frame (évite les écarts du ViewTimeline natif
 * sur certaines propriétés, observés sur Chrome).
 */
export function useScrollMap<T extends number | string>(value: MotionValue<number>, input: number[], output: T[]) {
  const key = `${input.join(",")}|${output.join(",")}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => interpolate(input, output), [key]);
  return useTransform(value, (v) => map(v));
}

/** Apparition fondu + translation à l'entrée dans le viewport. */
export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; y?: number; as?: "div" | "li" | "p" | "section" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ duration: 0.9, ease: EASE, delay }}>
      {children}
    </Comp>
  );
}

/** Titre révélé ligne par ligne (masque). */
export function LineReveal({ lines, className, as = "h2", id, delay = 0 }: { lines: React.ReactNode[]; className?: string; as?: "h1" | "h2" | "h3" | "p"; id?: string; delay?: number }) {
  const Comp = motion[as];
  return (
    <Comp id={id} className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className="block" variants={{ hidden: { y: "108%" }, show: { y: "0%" } }} transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.1 }}>
            {l}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

/** Image révélée par un masque vertical + parallaxe légère. */
export function MaskReveal({ children, className, parallax = 6 }: { children: React.ReactNode; className?: string; parallax?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useScrollMap(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);
  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div className="absolute -inset-y-[8%] inset-x-0" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Attraction légère vers le curseur (desktop). */
export function Magnetic({ children, className, strength = 8 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * strength);
        y.set(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
