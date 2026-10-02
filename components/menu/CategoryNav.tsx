"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuGroup } from "@/types/category";
import { cn } from "@/lib/utils";

/** Sous-navigation collante (sous la barre noire), suit la section visible. */
export function CategoryNav({ groups, className }: { groups: MenuGroup[]; className?: string }) {
  const [active, setActive] = useState<string>(groups[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = groups.map((g) => document.getElementById(g.id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [groups]);

  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !el) return;
    list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Catégories de la carte" className={cn("scheme-light sticky top-16 z-30 border-b border-ink/15 bg-bone/95", className)}>
      <ul ref={listRef} className="no-scrollbar shell flex overflow-x-auto">
        {groups.map((g, i) => (
          <li key={g.id} data-id={g.id} className="shrink-0">
            <a
              href={`#${g.id}`}
              aria-current={active === g.id ? "true" : undefined}
              className={cn(
                "flex h-12 items-center gap-2 px-3 font-display text-[1.05rem] leading-none tracking-[0.03em] whitespace-nowrap uppercase transition-colors md:px-4",
                active === g.id ? "bg-ink text-bone" : "text-ink/55 hover:text-ink",
              )}
            >
              <span className={cn("font-sans text-[0.6rem] font-semibold tabular-nums", active === g.id ? "text-cheddar" : "text-ink/35")}>{String(i + 1).padStart(2, "0")}</span>
              {g.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
