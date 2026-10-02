"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

declare global {
  interface Window {
    __bymReady?: boolean;
  }
}

/**
 * Transition de page : rideau noir + logo, wipe vertical (~450 ms).
 * Jamais affichée au premier chargement (pas de loader artificiel, LCP préservé).
 */
export function PageCurtain() {
  const [show, setShow] = useState(() => typeof window !== "undefined" && window.__bymReady === true);
  useEffect(() => {
    window.__bymReady = true;
  }, []);
  if (!show) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95] grid place-items-center bg-ink"
      initial={{ y: "0%" }}
      animate={{ y: "-100%" }}
      transition={{ duration: 0.48, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => setShow(false)}
    >
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}>
        <Logo size={72} />
      </motion.div>
    </motion.div>
  );
}
