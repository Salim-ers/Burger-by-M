"use client";

import { useSite } from "@/features/site-context";
import { CategoryNav } from "./CategoryNav";
import { OrderingStatus } from "./OrderingStatus";
import { ProductCard, ProductRow } from "./ProductCard";

/** La carte : catégories collantes, cartes photo pour les plats, lignes compactes pour le reste. */
export function MenuView() {
  const { menu, store } = useSite();
  return (
    <>
      <section className="on-light bg-ivory pt-24 pb-8 md:pt-32 md:pb-10">
        <div className="shell">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="kicker text-brass-deep">Smashed to order · {store.city}</p>
              <h1 className="display-2 mt-4">
                La <span className="italic">carte.</span>
              </h1>
            </div>
            <p className="max-w-sm text-[0.98rem] leading-relaxed text-sub md:pb-2 md:text-right">Touchez un produit pour le composer : retirez, ajoutez, passez-le en menu. Le prix se met à jour en direct.</p>
          </div>
          <OrderingStatus className="mt-7" />
        </div>
      </section>

      <CategoryNav categories={menu} />

      <div className="shell pb-32 md:pb-40">
        {menu.map((c, ci) => {
          const withPhoto = c.products.filter((p) => p.image);
          const compact = c.products.filter((p) => !p.image);
          return (
            <section key={c.id} id={`cat-${c.slug}`} aria-labelledby={`cat-title-${c.slug}`} className="pt-16 md:pt-24">
              <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-ink pb-5">
                <div className="flex items-baseline gap-5">
                  <span className="kicker text-brass-deep tabular-nums">{String(ci + 1).padStart(2, "0")}</span>
                  <h2 id={`cat-title-${c.slug}`} className="display-3">
                    {c.title}
                  </h2>
                </div>
                {c.note && <p className="font-serif text-lg text-sub italic">{c.note}</p>}
              </header>
              {withPhoto.length > 0 && (
                <div className="grid gap-x-6 gap-y-14 pt-10 sm:grid-cols-2 xl:grid-cols-3">
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
          <p>Allergènes : la liste des allergènes de chaque recette est disponible au restaurant. Appelez-nous au {store.phone} avant de commander en cas d’allergie.</p>
        </div>
      </div>
    </>
  );
}
