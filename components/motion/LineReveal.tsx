"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

interface Props {
  lines: React.ReactNode[];
  as?: Tag;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  id?: string;
}

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Titre révélé ligne par ligne (masque par le bas) à l'entrée dans le viewport. */
export function LineReveal({ lines, as = "h2", className, lineClassName, delay = 0, stagger = 0.07, id }: Props) {
  const Comp = motion[as];
  return (
    <Comp id={id} className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {lines.map((line, i) => (
        <span key={i} className={cn("block overflow-hidden pb-[0.04em] -mb-[0.04em]", lineClassName)}>
          <motion.span
            className="block will-change-transform"
            variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
            transition={{ duration: 0.75, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

/** Apparition simple (fondu + montée) à l'entrée dans le viewport. */
export function FadeIn({ children, className, delay = 0, y = 18, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; y?: number; as?: "div" | "p" | "li" | "ul" }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}
