"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Fil de progression de 1 px sur le bord droit (cheddar, discret). Pas sur l'accueil, où seules les images parlent. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const home = usePathname() === "/";
  useEffect(() => {
    // Sur l'accueil, le fil n'est pas affiché : pas d'écouteur de défilement (ni de lecture de mise en page par image).
    if (home) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleY(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [home]);
  if (home) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed top-0 right-0 z-[70] h-dvh w-px bg-transparent">
      <div ref={ref} className="h-full w-full origin-top scale-y-0 bg-cheddar/80" />
    </div>
  );
}
