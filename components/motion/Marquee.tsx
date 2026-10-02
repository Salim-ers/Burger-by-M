"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { cn } from "@/lib/utils";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * Bande typographique infinie. Vitesse de base + accélération selon la vitesse de scroll
 * (et inversion du sens quand on remonte). Statique si mouvement réduit.
 */
export function Marquee({ items, className, speed = 3, direction = 1, separator = "—" }: { items: string[]; className?: string; speed?: number; direction?: 1 | -1; separator?: string }) {
  const reduce = useReduce();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef<number>(direction);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) dir.current = -direction;
    else if (f > 0) dir.current = direction;
    const move = dir.current * -speed * (delta / 1000) * (1 + Math.abs(f));
    base.set(base.get() + move);
  });

  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span className="px-[0.18em]">{item}</span>
          <span className="px-[0.18em] opacity-90">{separator}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={cn("relative flex overflow-hidden whitespace-nowrap", className)}>
      <p className="sr-only">{items.join(", ")}</p>
      <motion.div className="flex w-max will-change-transform" style={{ x }} aria-hidden>
        {row}
        {row}
      </motion.div>
    </div>
  );
}
