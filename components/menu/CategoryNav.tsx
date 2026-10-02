"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuGroup } from "@/types/category";
import { cn } from "@/lib/utils";

/** Sous-navigation collante, suit la section visible (IntersectionObserver). */
export function CategoryNav({ groups, top = "top-16" }: { groups: MenuGroup[]; top?: string }) {
  const [active, setActive] = useState<string>("tout");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = groups.map((g) => document.getElementById(g.id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [groups]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const items = [{ id: "tout", label: "Tout" }, ...groups];

  return (
    <nav aria-label="Catégories de la carte" className={cn("sticky z-30 border-y border-cream/10 bg-ink/90 backdrop-blur-[6px]", top)}>
      <ul ref={listRef} className="no-scrollbar container-site flex gap-1 overflow-x-auto py-2.5">
        {items.map((g) => (
          <li key={g.id} data-id={g.id}>
            <a
              href={g.id === "tout" ? "#carte" : `#${g.id}`}
              aria-current={active === g.id ? "true" : undefined}
              className={cn(
                "relative flex h-11 items-center px-4 text-[0.82rem] font-semibold whitespace-nowrap transition-colors",
                active === g.id ? "text-cream" : "text-cream/55 hover:text-cream",
              )}
            >
              {g.label}
              <span
                className={cn(
                  "absolute inset-x-4 bottom-1.5 h-px origin-left bg-rose transition-transform duration-500 ease-out-expo",
                  active === g.id ? "scale-x-100" : "scale-x-0",
                )}
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
