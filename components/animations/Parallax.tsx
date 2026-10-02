"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

/** Translation verticale liée au scroll. Coupée sur mobile et en mouvement réduit (60 FPS garantis). */
export function Parallax({ children, offset = 60, className }: { children: React.ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={reduce || !desktop ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}
