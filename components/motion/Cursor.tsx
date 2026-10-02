"use client";

import { useEffect, useRef, useState } from "react";

const LABELS: Record<string, string> = { view: "View", add: "Add", go: "Go" };

/**
 * Curseur desktop uniquement (pointeur fin, sans mouvement réduit) : un point qui suit la souris,
 * qui devient une pastille VIEW (images), ADD (produits) ou GO (CTA) sur les éléments [data-cursor].
 * Le curseur natif reste visible (accessibilité). Totalement désactivé sur tactile.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      setHidden(false);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      const key = target?.dataset.cursor;
      setLabel(key ? (LABELS[key] ?? key) : null);
    };
    const loop = () => {
      cx += (x - cx) * 0.25;
      cy += (y - cy) * 0.25;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const reset = () => setLabel(null);
    const leave = () => setHidden(true);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", reset);
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", reset);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[130]" style={{ opacity: hidden ? 0 : 1 }}>
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-[0.95rem] tracking-[0.06em] uppercase transition-[width,height,background-color] duration-300 ease-out-expo"
        style={{
          width: label ? 68 : 8,
          height: label ? 68 : 8,
          backgroundColor: label ? "var(--color-cheddar)" : "var(--color-bone)",
          color: "var(--color-ink)",
          mixBlendMode: label ? "normal" : "difference",
        }}
      >
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}
