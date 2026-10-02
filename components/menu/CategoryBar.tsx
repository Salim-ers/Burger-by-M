"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { categoryAnchor, type Category } from "@/types/category";
import { cn } from "@/lib/utils";

const TOP = "carte-top";

/**
 * Barre de catégories collante sous l'en-tête. Défilement horizontal sur mobile,
 * catégorie active = dernière section dont le titre est passé sous la barre.
 */
export function CategoryBar({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState<string>(TOP);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ids = categories.map((c) => categoryAnchor(c.id));
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = (navRef.current?.getBoundingClientRect().bottom ?? 140) + 24;
      let current = TOP;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // Bas de page atteint : la dernière catégorie est active.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1] ?? current;
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories]);

  // Garde la pastille active visible dans la barre (mobile).
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !el) return;
    list.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  const items = [{ id: TOP, label: "Tout" }, ...categories.map((c) => ({ id: categoryAnchor(c.id), label: c.name }))];

  return (
    <nav ref={navRef} aria-label="Catégories de la carte" className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur-sm md:top-[72px]">
      <ul ref={listRef} className="no-scrollbar shell flex gap-2 overflow-x-auto py-3">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} data-id={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn("relative flex h-11 items-center rounded-full px-4 text-[0.92rem] font-semibold whitespace-nowrap transition-colors", isActive ? "text-white" : "bg-cream text-ink hover:bg-stone/60")}
              >
                {isActive && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span className="relative">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
