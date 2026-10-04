"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Curseur légèrement personnalisé (desktop, pointeur fin, hors mouvement réduit) :
 * un anneau qui suit la souris et s'élargit sur les éléments interactifs. Le curseur natif reste visible.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      setHover(Boolean((e.target as HTMLElement | null)?.closest("a,button,[role=button],label")));
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[90]">
      <div
        className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-brass/80 transition-[width,height,background-color] duration-300 ease-out-expo"
        style={{ width: hover ? 44 : 14, height: hover ? 44 : 14, backgroundColor: hover ? "rgb(199 166 106 / 0.12)" : "transparent" }}
      />
    </div>
  );
}
