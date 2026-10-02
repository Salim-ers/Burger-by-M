"use client";

import { CategoryBar } from "./CategoryBar";
import { ProductCard } from "./ProductCard";
import { StatusStrip } from "./StatusStrip";
import { useMenuSections } from "@/hooks/use-menu-sections";
import { categoryAnchor } from "@/types/category";
import { cn } from "@/lib/utils";

/**
 * La carte : bandeau d'état, catégories collantes, sections de produits.
 * `aside` : panier latéral (desktop) de /commander.
 */
export function MenuView({ aside }: { aside?: React.ReactNode }) {
  const sections = useMenuSections();
  return (
    <>
      <StatusStrip />
      <CategoryBar categories={sections.map((s) => s.category)} />
      <div id="carte-top" className="shell pt-8 pb-20 md:pt-10">
        <div className={cn(aside && "lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 xl:grid-cols-[1fr_380px]")}>
          <div className="min-w-0 space-y-12 md:space-y-16">
            {sections.map(({ category, items }, si) => (
              <section key={category.id} id={categoryAnchor(category.id)} aria-labelledby={`${categoryAnchor(category.id)}-title`}>
                <header className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-3 md:mb-5">
                  <h2 id={`${categoryAnchor(category.id)}-title`} className="font-display text-[2.2rem] leading-none md:text-[2.8rem]">
                    {category.title}
                  </h2>
                  {category.note && <p className="text-[0.9rem] text-muted">{category.note}</p>}
                </header>
                <div className={cn("grid gap-3 md:grid-cols-2 md:gap-4", aside ? "2xl:grid-cols-3" : "xl:grid-cols-3")}>
                  {items.map((p, i) => (
                    <ProductCard key={p.id} product={p} priority={si === 0 && i < 3} />
                  ))}
                </div>
              </section>
            ))}
            <p className="text-sm leading-relaxed text-muted">
              Photos non contractuelles. Les préparations faites maison sont précisées sur chaque produit. Allergènes : informations disponibles au restaurant.
            </p>
          </div>
          {aside && (
            <div className="hidden lg:block">
              <div className="sticky top-40">{aside}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
