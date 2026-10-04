"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuCategory } from "@/features/menu/types";
import { cn } from "@/lib/utils";

/** Catégories collantes sous le header (défilement horizontal sur mobile), section visible suivie. */
export function CategoryNav({ categories }: { categories: Pick<MenuCategory, "id" | "slug" | "name">[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories.map((c) => document.getElementById(`cat-${c.slug}`)).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : Number.POSITIVE_INFINITY);
        const first = [...visible.entries()].filter(([, top]) => Number.isFinite(top)).sort((a, b) => a[1] - b[1])[0];
        if (first) setActive(first[0].replace(/^cat-/, ""));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [categories]);

  // Garde l'onglet actif visible dans la barre (sans faire défiler la page).
  useEffect(() => {
    const nav = navRef.current;
    const el = nav?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    if (!nav || !el) return;
    nav.scrollTo({ left: el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Catégories de la carte" className="sticky top-16 z-30 border-b border-rule bg-ivory/90 backdrop-blur-md">
      <div ref={navRef} className="no-scrollbar container-bm flex gap-1 overflow-x-auto">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.slug}`}
            data-slug={c.slug}
            data-no-transition
            aria-current={active === c.slug ? "true" : undefined}
            onClick={() => setActive(c.slug)}
            className={cn("t-label relative shrink-0 px-4 py-4 whitespace-nowrap transition-colors md:px-5", active === c.slug ? "text-ink" : "text-ink/40 hover:text-ink")}
          >
            {c.name}
            <span className={cn("absolute inset-x-4 bottom-0 h-[2px] origin-left bg-cheddar transition-transform duration-500 ease-[var(--ease-food)] md:inset-x-5", active === c.slug ? "scale-x-100" : "scale-x-0")} />
          </a>
        ))}
      </div>
    </nav>
  );
}
