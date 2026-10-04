"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, finePointer, reducedMotion } from "./gsap";

declare global {
  interface Window {
    __bymLenis?: Lenis | null;
  }
}

/** Arrête / reprend le défilement doux (fenêtres modales). Sans Lenis : sans effet. */
export function lockSmoothScroll(locked: boolean) {
  const l = typeof window !== "undefined" ? window.__bymLenis : null;
  if (!l) return;
  if (locked) l.stop();
  else l.start();
}

/**
 * Défilement doux Lenis synchronisé avec ScrollTrigger — desktop à souris uniquement,
 * jamais en mouvement réduit. Le défilement natif tactile n'est pas modifié ; clavier et ancres fonctionnent.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (reducedMotion() || !finePointer()) return;
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -120 },
      // Les zones défilantes des fenêtres (panier, fiche produit…) gardent le défilement natif.
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent], [role=dialog]")),
    });
    window.__bymLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__bymLenis = null;
    };
  }, []);

  // Changement de page : retour en haut immédiat, puis recalcul des déclencheurs.
  useEffect(() => {
    window.__bymLenis?.scrollTo(0, { immediate: true, force: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return children;
}
