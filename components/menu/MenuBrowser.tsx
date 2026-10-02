"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryNav } from "./CategoryNav";
import { MenuRow } from "./MenuRow";
import { PreviewPane } from "./PreviewPane";
import { useMenuSections } from "@/hooks/use-menu-sections";
import { rectOf } from "@/stores/ui-store";
import { getImage } from "@/data/images";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

/**
 * Carte complète façon carte imprimée (fond blanc cassé).
 * editorial (/menu) : grandes lignes + photo contextuelle collante à droite, qui suit la rubrique lue.
 * compact (/commander) : liste dense, sans photo, orientée conversion.
 */
export function MenuBrowser({ variant = "editorial" }: { variant?: "editorial" | "compact" }) {
  const { sections, groups } = useMenuSections();
  const editorial = variant === "editorial";
  const [hovered, setHovered] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  // Rubrique en cours de lecture → photo de couverture du panneau.
  useEffect(() => {
    if (!editorial) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-menu-category]"));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveCategory(visible.target.getAttribute("data-menu-category"));
          setHovered(null);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [editorial, sections]);

  const cover = useMemo(() => {
    const items = sections.find((s) => s.category.id === activeCategory)?.items ?? sections[0]?.items ?? [];
    return items.find((p) => p.popular && p.image) ?? items.find((p) => p.image) ?? items[0] ?? null;
  }, [sections, activeCategory]);

  const getOrigin = useCallback(
    (p: Product) => {
      const pane = paneRef.current;
      const paneShowsIt = editorial && pane && pane.offsetParent !== null && (hovered?.id ?? cover?.id) === p.id && getImage(p.image);
      return paneShowsIt ? rectOf(pane) : null;
    },
    [editorial, hovered, cover],
  );

  return (
    <div id="carte" className="scheme-light bg-bone text-ink">
      <CategoryNav groups={groups} />
      <div className={cn("shell", editorial && "lg:grid-12")}>
        <div className={cn(editorial && "lg:col-span-8")}>
          {sections.map(({ category, anchor, items }, si) => (
            <section key={category.id} id={anchor} data-menu-category={category.id} aria-labelledby={`cat-${category.id}`} className={cn("scroll-mt-32", editorial ? "pt-16 md:pt-24" : "pt-12")}>
              <header className="flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
                <div className="min-w-0">
                  <h2 id={`cat-${category.id}`} className={cn("font-display", editorial ? "text-d3" : "text-d4")}>
                    {category.title.replace(/\.$/, "")} <span className="text-ink/25">— {String(si + 1).padStart(2, "0")}</span>
                  </h2>
                  {category.note && <p className="kicker mt-3 text-ink/55">{category.note}</p>}
                </div>
                <span className="kicker shrink-0 pb-1 text-ink/45 tabular-nums">{items.length} choix</span>
              </header>
              <div>
                {items.map((p, i) => (
                  <MenuRow key={p.id} product={p} index={i} variant={variant} onHover={editorial ? setHovered : undefined} active={editorial && hovered?.id === p.id} getOrigin={getOrigin} />
                ))}
              </div>
            </section>
          ))}
          <p className="py-16 text-xs leading-relaxed text-ink/45">
            Photos non contractuelles. Les préparations faites maison sont précisées sur chaque produit.
            <br />
            Allergènes : informations disponibles auprès du restaurant.
          </p>
        </div>

        {editorial && (
          <aside aria-label="Aperçu du produit" className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-36 pt-24">
              <PreviewPane ref={paneRef} product={hovered} cover={cover ? { product: cover } : null} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
