"use client";

import { useEffect, useRef, useState } from "react";
import { finePointer, reducedMotion } from "@/components/motion/gsap";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { add: "Ajouter", view: "Voir", open: "Ouvrir", drag: "Glisser" };

/**
 * Étiquette qui suit la souris, uniquement là où elle informe : produits (« AJOUTER »), photos (« VOIR »)
 * et galerie (« OUVRIR »), via data-cursor. Ailleurs, rien : seul le curseur natif reste visible.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<string>("idle");

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    setEnabled(true);
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      setMode(labelled?.dataset.cursor ?? "idle");
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const leave = () => setMode("hidden");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  const label = LABELS[mode];
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[150] mix-blend-normal">
      <div
        className={cn(
          "grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[width,height,background-color,border-color,opacity] duration-300 ease-[var(--ease-food)]",
          label ? "size-20 bg-cheddar text-ink" : "size-2.5 bg-cheddar opacity-0",
        )}
      >
        {label && <span className="t-label text-[0.58rem] tracking-[0.18em]">{label}</span>}
      </div>
    </div>
  );
}
