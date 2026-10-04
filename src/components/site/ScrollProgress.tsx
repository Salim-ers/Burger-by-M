"use client";

import { useEffect, useRef } from "react";

/** Fil de progression de 1 px sur le bord droit (cheddar, discret). */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed top-0 right-0 z-[70] h-dvh w-px bg-transparent">
      <div ref={ref} className="h-full w-full origin-top scale-y-0 bg-cheddar/80" />
    </div>
  );
}
