"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Chiffres qui défilent verticalement (compteur mécanique).
 * `value` est affiché avec `pad` chiffres minimum.
 */
export function RollingNumber({ value, pad = 2, className }: { value: number; pad?: number; className?: string }) {
  const chars = String(Math.max(0, Math.trunc(value))).padStart(pad, "0").split("");
  return (
    <span className={cn("inline-flex overflow-hidden tabular-nums leading-none", className)}>
      <span className="sr-only">{value}</span>
      {chars.map((c, i) => (
        <span key={chars.length - i} aria-hidden className="relative inline-block h-[1.2em] overflow-hidden">
          <motion.span
            className="flex flex-col"
            initial={false}
            animate={{ y: `-${Number(c) * 10}%` }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            {DIGITS.map((d) => (
              <span key={d} className="block h-[1.2em] leading-[1.2em]">
                {d}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
