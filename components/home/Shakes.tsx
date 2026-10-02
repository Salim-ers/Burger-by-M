"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { LineReveal } from "@/components/motion/LineReveal";
import { ProductPoster } from "@/components/product/ProductVisual";
import { Price } from "@/components/ui/Price";
import { Arrow } from "@/components/ui/Button";
import { useMenuProducts } from "@/hooks/use-menu";
import { rectOf, useUiStore } from "@/stores/ui-store";
import { getImage } from "@/data/images";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Product } from "@/types/product";

const ORDER = ["dubai-shake", "bueno-bomb", "milkshake-a-composer"];

/**
 * 08 — SHAKE BREAK. Fond gris métal (zéro rose). Les deux vraies photos de shakes côte à côte,
 * le Bueno Bomb’ (pas de photo) en affiche typographique. Léger défilement horizontal au scroll.
 */
export function Shakes() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const desktop = useMediaQuery("(min-width: 768px)");
  const products = useMenuProducts();
  const shakes = ORDER.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  const tiramisu = products.find((p) => p.id === "tiramisu");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const wipe = useScrollMap(scrollYProgress, [0.02, 0.2], [1, 0]);
  const rowX = useScrollMap(scrollYProgress, [0.15, 0.85], ["3%", "-3%"]);

  return (
    <section ref={ref} aria-labelledby="shakes-title" className="scheme-light relative isolate overflow-hidden bg-stone py-20 text-ink md:py-32">
      {!reduce && <motion.div aria-hidden className="absolute inset-0 -z-10 origin-top bg-cheddar" style={{ scaleY: wipe }} />}
      <div className="shell">
        <div className="grid-12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-8">
            <p className="kicker mb-6 text-ink/55">08 — Milkshakes</p>
            <LineReveal id="shakes-title" lines={["Shake", "break."]} className="font-display text-d1" />
          </div>
          <p className="col-span-12 max-w-xs font-display text-d5 lg:col-span-4 lg:justify-self-end">Pistache. Bueno. Ou tu composes.</p>
        </div>
      </div>

      <div className="no-scrollbar mt-14 overflow-x-auto md:overflow-visible">
        <motion.ul className="shell flex w-max gap-3 md:w-auto md:gap-[1.6vw]" style={reduce || !desktop ? undefined : { x: rowX }}>
          {shakes.map((p, i) => (
            <ShakePanel key={p.id} product={p} index={i} />
          ))}
        </motion.ul>
      </div>

      <div className="shell mt-12 flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-ink pt-5">
        <p className="kicker text-ink/60">Toppings : Kinder Bueno White · Kinder Bueno · Oreo · Speculoos — Coulis : caramel · chocolat · Nutella</p>
        {tiramisu && (
          <p className="font-display text-2xl">
            Et un tiramisu — <Price cents={tiramisu.price} />
          </p>
        )}
      </div>
    </section>
  );
}

function ShakePanel({ product, index }: { product: Product; index: number }) {
  const openProduct = useUiStore((s) => s.openProduct);
  const ref = useRef<HTMLDivElement>(null);
  const image = getImage(product.image);
  return (
    <li className="w-[78vw] shrink-0 sm:w-[46vw] md:w-[30vw] md:flex-1">
      <button type="button" data-cursor="add" onClick={() => openProduct(product.id, undefined, rectOf(ref.current))} className="group group/btn block w-full text-left">
        <div ref={ref} className="relative aspect-[3/4] overflow-hidden bg-ink">
          {image ? (
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 30vw, 78vw" quality={88} className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" style={{ objectPosition: image.position }} />
          ) : (
            <ProductPoster name={product.name} className="absolute inset-0 bg-ink" />
          )}
          <span className="kicker absolute top-3 left-3 bg-bone px-1.5 py-0.5 text-ink">Milkshake {String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
          <h3 className="font-display text-d4 leading-none">{product.name}</h3>
          <span className="font-display text-2xl">
            <Price cents={product.price} />
          </span>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/65">{product.description}</p>
        <span className="mt-3 inline-flex items-center gap-2 font-display text-lg uppercase transition-colors group-hover:text-ink/60">
          Choisir <Arrow />
        </span>
      </button>
    </li>
  );
}
