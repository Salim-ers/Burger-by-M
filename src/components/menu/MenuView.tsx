"use client";

import { useSite } from "@/features/site-context";
import { CategoryNav } from "./CategoryNav";
import { RestaurantBar } from "./RestaurantBar";
import { ProductCard, ProductRow } from "./ProductCard";

/** NOTRE CARTE. — grille éditoriale 2 colonnes (desktop), photos bord à bord (mobile). */
export function MenuView() {
  const { menu, store } = useSite();
  return (
    <>
      <section data-theme="light" className="on-light bg-ivory pt-28 md:pt-36">
        <div className="container-bm">
          <p className="t-label text-cheddar-deep">Smashed to order · {store.city}</p>
          <h1 className="mt-4 flex flex-wrap items-baseline gap-x-5">
            <span className="t-xxl">Notre</span>
            <span className="s-xxl">carte.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-sub">Touchez un produit pour le composer : retirez, ajoutez, passez-le en menu. Le prix se met à jour en direct.</p>
          <RestaurantBar className="mt-10" />
        </div>
      </section>

      <CategoryNav categories={menu} />

      <div data-theme="light" className="on-light bg-ivory pb-32 md:pb-40">
        <div className="container-bm">
          {menu.map((c, ci) => {
            const withPhoto = c.products.filter((p) => p.image);
            const compact = c.products.filter((p) => !p.image);
            return (
              <section key={c.id} id={`cat-${c.slug}`} aria-labelledby={`cat-title-${c.slug}`} className="pt-16 md:pt-24">
                <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-ink pb-4">
                  <div className="flex items-baseline gap-5">
                    <span className="t-label text-cheddar-deep tabular-nums">{String(ci + 1).padStart(2, "0")}</span>
                    <h2 id={`cat-title-${c.slug}`} className="t-l">
                      {c.title}
                    </h2>
                  </div>
                  {c.note && <p className="s-m text-sub">{c.note}</p>}
                </header>
                {withPhoto.length > 0 && (
                  <div className="-mx-[var(--gutter)] grid gap-y-10 pt-8 md:mx-0 md:grid-cols-2 md:gap-x-6 md:gap-y-12">
                    {withPhoto.map((p, i) => (
                      <ProductCard key={p.id} product={p} priority={ci === 0 && i < 2} />
                    ))}
                  </div>
                )}
                {compact.length > 0 && (
                  <ul className="grid gap-x-12 pt-4 md:grid-cols-2">
                    {compact.map((p) => (
                      <ProductRow key={p.id} product={p} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          <div className="mt-24 grid gap-6 border-t border-rule pt-8 text-xs leading-relaxed text-sub md:grid-cols-2">
            <p>Photos non contractuelles. Les visuels marqués « photo d’illustration » montrent une préparation proche, pas le produit exact.</p>
            <p>Allergènes : la liste des allergènes de chaque recette est disponible au restaurant. En cas d’allergie, appelez-nous au {store.phone} avant de commander.</p>
          </div>
        </div>
      </div>
    </>
  );
}
