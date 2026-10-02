"use client";

import Image from "next/image";
import { useMemo } from "react";
import { CategoryNav } from "./CategoryNav";
import { FoodRow } from "./FoodRow";
import { useMenuCategories, useMenuProducts } from "@/hooks/use-menu";
import { menuGroups } from "@/data/categories";
import { getImage } from "@/data/images";
import { cn } from "@/lib/utils";

/** Carte complète, regroupée et filtrable. Réutilisée par /menu et /commander. */
export function MenuBrowser({ navTop, showBanners = true }: { navTop?: string; showBanners?: boolean }) {
  const products = useMenuProducts();
  const categories = useMenuCategories();

  const sections = useMemo(() => {
    const seen = new Set<string>();
    return categories
      .filter((c) => c.active)
      .map((c) => {
        const anchor = seen.has(c.group) ? undefined : c.group;
        seen.add(c.group);
        return { category: c, anchor, items: products.filter((p) => p.category === c.id) };
      })
      .filter((s) => s.items.length > 0);
  }, [categories, products]);

  const groups = menuGroups.filter((g) => sections.some((s) => s.category.group === g.id));

  return (
    <div id="carte">
      <CategoryNav groups={groups} top={navTop} />
      <div className="container-site">
        {sections.map(({ category, anchor, items }) => {
          const banner = showBanners ? getImage(category.imageId) : null;
          return (
            <section key={category.id} id={anchor} aria-labelledby={`cat-${category.id}`} className="scroll-mt-32 pt-20 md:pt-28">
              {banner ? (
                <div className="relative isolate grid overflow-hidden rounded-xs bg-ink-warm md:grid-cols-2">
                  <div className="relative h-56 md:order-2 md:h-72">
                    <Image src={banner.src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[50%_55%]" />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent md:hidden" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:static md:flex md:items-end md:p-10">
                    <CategoryTitle id={category.id} title={category.title} note={category.note} count={items.length} />
                  </div>
                </div>
              ) : (
                <div className="border-b border-cream/15 pb-6">
                  <CategoryTitle id={category.id} title={category.title} note={category.note} count={items.length} />
                </div>
              )}
              <div className={cn(banner && "mt-2")}>
                {items.map((p) => (
                  <FoodRow key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
        <p className="py-16 text-center text-xs leading-relaxed text-cream/45">
          Photos non contractuelles. Certaines préparations sont faites maison (précisé sur chaque produit).
          <br />
          Allergènes : informations disponibles auprès du restaurant.
        </p>
      </div>
    </div>
  );
}

function CategoryTitle({ id, title, note, count }: { id: string; title: string; note?: string; count: number }) {
  return (
    <div className="flex w-full items-end justify-between gap-6">
      <div>
        <h2 id={`cat-${id}`} className="font-display text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.85] font-medium tracking-[-0.035em] uppercase">
          {title}
        </h2>
        {note && <p className="mt-3 text-sm text-cream/70">{note}</p>}
      </div>
      <span className="shrink-0 pb-2 text-xs text-cream/55 tabular-nums">{count} choix</span>
    </div>
  );
}
