"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    __bymReady?: boolean;
  }
}

/**
 * Transition de route (~350 ms) : panneau noir plein écran, « BY M » en flash, puis le panneau
 * traverse l'écran vers la gauche et découvre la nouvelle page.
 * Jamais au premier chargement (l'intro du hero s'en charge, sans loader).
 */
export function RouteTransition() {
  const [show, setShow] = useState(() => typeof window !== "undefined" && window.__bymReady === true);
  useEffect(() => {
    // Après la première page : l'intro (logo) du hero ne rejoue plus.
    if (window.__bymReady) document.documentElement.dataset.nav = "1";
    window.__bymReady = true;
  }, []);
  if (!show) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[110] grid place-items-center bg-ink"
      initial={{ x: "0%" }}
      animate={{ x: "-101%" }}
      transition={{ duration: 0.3, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => setShow(false)}
    >
      <motion.span
        className="font-display text-[clamp(4rem,14vw,12rem)] leading-none text-bone"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
      >
        By <span className="text-cheddar">M</span>
      </motion.span>
    </motion.div>
  );
}
