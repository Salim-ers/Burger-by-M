"use client";

import { useRef } from "react";
import { motion, useScroll, type MotionValue } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { cn } from "@/lib/utils";

/**
 * Manifeste : les mots s'allument un à un, pilotés par le scroll.
 * `lines` = lignes de mots (chaque ligne passe à la ligne).
 */
export function WordScrub({ lines, className, dim = 0.12, as: Tag = "h2", id }: { lines: string[]; className?: string; dim?: number; as?: "h2" | "p"; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = lines.flatMap((line, li) => line.split(" ").map((w, wi) => ({ w, li, first: wi === 0 && li > 0 })));
  const total = words.length;

  return (
    <Tag ref={ref} id={id} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden>
        {words.map(({ w, first }, i) => (
          <span key={i}>
            {first && <br />}
            <Word progress={scrollYProgress} range={[i / total, (i + 1) / total]} dim={reduce ? 1 : dim}>
              {w}
            </Word>{" "}
          </span>
        ))}
      </span>
    </Tag>
  );
}

function Word({ children, progress, range, dim }: { children: string; progress: MotionValue<number>; range: [number, number]; dim: number }) {
  const opacity = useScrollMap(progress, range, [dim, 1]);
  const y = useScrollMap(progress, range, ["0.08em", "0em"]);
  return (
    <motion.span style={{ opacity, y }} className={cn("inline-block will-change-[opacity]")}>
      {children}
    </motion.span>
  );
}
