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

const EASE = [0.16, 1, 0.3, 1] as const;

/** Révélation ligne par ligne, masquée par le bas — déclenchée à l'entrée dans le viewport. */
export function RevealText({ lines, as = "h2", className, lineClassName, delay = 0, stagger = 0.09, id }: Props) {
  const Comp = motion[as];
  return (
    <Comp id={id} className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      {lines.map((line, i) => (
        <span key={i} className={cn("block overflow-hidden pb-[0.08em] -mb-[0.08em]", lineClassName)}>
          <motion.span
            className="block will-change-transform"
            variants={{ hidden: { y: "108%" }, show: { y: "0%" } }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}
