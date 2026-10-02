"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Curseur desktop : petit cercle qui suit la souris et affiche un mot sur les éléments [data-cursor].
 * Le curseur natif reste visible (accessibilité). Inactif sur tactile et en mouvement réduit.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const reset = () => setLabel(null);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", reset);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", reset);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference">
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-[0.62rem] font-bold tracking-[0.14em] text-ink uppercase transition-[width,height] duration-300 ease-out-expo"
        style={{ width: label ? 84 : 10, height: label ? 84 : 10 }}
      >
        {label && <span className="mix-blend-normal">{label}</span>}
      </div>
    </div>
  );
}
