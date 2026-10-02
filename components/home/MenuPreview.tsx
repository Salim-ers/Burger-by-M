"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuRow } from "@/components/menu/MenuRow";
import { PreviewPane } from "@/components/menu/PreviewPane";
import { ButtonLink } from "@/components/ui/Button";
import { LineReveal } from "@/components/motion/LineReveal";
import { useMenuProducts } from "@/hooks/use-menu";
import { rectOf } from "@/stores/ui-store";
import { getImage } from "@/data/images";
import type { CategoryId } from "@/types/category";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

const TABS: { id: string; label: string; categories: CategoryId[]; anchor: string }[] = [
  { id: "smash", label: "Smash", categories: ["smash"], anchor: "smash" },
  { id: "classics", label: "Classics", categories: ["classics"], anchor: "classics" },
  { id: "frenchys", label: "Frenchy’s", categories: ["frenchys"], anchor: "frenchys" },
  { id: "sides", label: "Sides", categories: ["frites", "extras"], anchor: "sides" },
  { id: "shakes", label: "Shakes", categories: ["milkshakes"], anchor: "desserts" },
  { id: "desserts", label: "Desserts", categories: ["desserts"], anchor: "desserts" },
];

/** 04 — LA CARTE. Le menu au centre de la home : liste premium + photo contextuelle au survol. */
export function MenuPreview() {
  const products = useMenuProducts();
  const [tab, setTab] = useState(TABS[0]!.id);
  const [hovered, setHovered] = useState<Product | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const current = TABS.find((t) => t.id === tab) ?? TABS[0]!;
  const items = useMemo(() => products.filter((p) => current.categories.includes(p.category)), [products, current]);
  const cover = items.find((p) => p.popular && p.image) ?? items.find((p) => p.image) ?? items[0] ?? null;

  const getOrigin = useCallback(
    (p: Product) => {
      const pane = paneRef.current;
      const shows = pane && pane.offsetParent !== null && (hovered?.id ?? cover?.id) === p.id && getImage(p.image);
      return shows ? rectOf(pane) : null;
    },
    [hovered, cover],
  );

  return (
    <section id="la-carte" aria-labelledby="carte-title" className="scheme-light scroll-mt-16 bg-bone py-20 text-ink md:py-32">
      <div className="shell">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <p className="kicker mb-6 text-ink/55">04 — Menu</p>
            <LineReveal id="carte-title" lines={["La", <>carte<span className="text-cheddar-deep">.</span></>]} className="font-display text-d1" />
          </div>
          <div className="col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-9">
            <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink/65">Smash, Classics au steak façon bouchère, Frenchy’s en baguette briochée, sides et shakes. Tout se commande en ligne, à emporter.</p>
          </div>
        </div>

        {/* Onglets */}
        <div role="tablist" aria-label="Catégories" className="no-scrollbar -mx-4 mt-12 flex overflow-x-auto border-y-2 border-ink px-4 md:mx-0 md:px-0">
          {TABS.map((t, i) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="carte-panel"
                onClick={() => {
                  setTab(t.id);
                  setHovered(null);
                }}
                className={cn(
                  "relative flex shrink-0 items-baseline gap-2 px-3 py-3 font-display text-[clamp(1.35rem,2.6vw,2.4rem)] leading-none uppercase transition-colors md:flex-1 md:px-4",
                  selected ? "bg-ink text-bone" : "text-ink/45 hover:text-ink",
                )}
              >
                <span className={cn("font-sans text-[0.6rem] font-semibold tabular-nums", selected ? "text-cheddar" : "text-ink/35")}>{String(i + 1).padStart(2, "0")}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="grid-12 mt-2 gap-y-10">
          <div id="carte-panel" role="tabpanel" aria-label={current.label} className="col-span-12 lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.12 } }} variants={{ show: { transition: { staggerChildren: 0.045 } } }}>
                {items.map((p, i) => (
                  <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }}>
                    <MenuRow product={p} index={i} onHover={setHovered} active={hovered?.id === p.id} getOrigin={getOrigin} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          <aside aria-label="Aperçu" className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 pt-6">
              <PreviewPane ref={paneRef} product={hovered} cover={cover ? { product: cover } : null} />
            </div>
          </aside>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href={`/menu#${current.anchor}`} variant="dark" size="lg" arrow>
            Voir toute la carte
          </ButtonLink>
          <ButtonLink href="/commander" variant="primary" size="lg" arrow>
            Commander
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
