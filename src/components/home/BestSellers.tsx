"use client";

import Image from "next/image";
import Link from "next/link";
import { useSite } from "@/features/site-context";
import { useUi } from "@/features/cart/store";
import { LineReveal, Reveal } from "@/components/motion";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/menu/ProductImage";
import type { MenuImage, MenuProduct } from "@/features/menu/types";
import { cn } from "@/lib/utils";

const PREFERRED = ["le-special", "le-montagnard", "le-forestier", "spicy-chicken"];

/** Version détourée du visuel de la carte (scripts/media/cutout.mjs), s'il en existe une. */
function cutoutFor(image: MenuImage | null) {
  const m = image?.src.match(/^\/images\/products\/([a-z0-9-]+)\.webp$/);
  return m ? `/images/cutouts/${m[1]}.webp` : null;
}

/** 4 produits en très grand : photo, nom XXL, prix, ingrédients ; « Ajouter » se révèle au survol. */
export function BestSellers() {
  const { products } = useSite();
  const all = [...products.values()];
  const picked = PREFERRED.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is MenuProduct => Boolean(p && p.image));
  const items = (picked.length >= 3 ? picked : all.filter((p) => p.isBestSeller && p.image)).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="best-title" className="on-light bg-paper py-24 md:py-36">
      <div className="shell flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="kicker text-brass-deep">Les incontournables</p>
          <LineReveal id="best-title" lines={["Ceux qu’on", <span key="i" className="italic">recommande.</span>]} className="display-2 mt-5" />
        </div>
        <Link href="/menu" className="kicker border-b border-ink/30 pb-1 transition-colors hover:border-ink">
          Toute la carte →
        </Link>
      </div>
      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] md:mx-auto md:grid md:max-w-[1440px] md:grid-cols-2 md:gap-x-6 md:gap-y-16 md:overflow-visible">
        {items.map((p, i) => (
          <BestSeller key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function BestSeller({ product, index }: { product: MenuProduct; index: number }) {
  const open = useUi((s) => s.openProduct);
  const cutout = cutoutFor(product.image);
  const orderable = product.isAvailable && product.priceCents !== null;
  return (
    <Reveal as="div" delay={(index % 2) * 0.12} className={cn("group w-[84vw] shrink-0 snap-center sm:w-[60vw] md:w-auto", index % 2 === 1 && "md:mt-24")}>
      <button type="button" onClick={() => open(product.id)} className="relative block w-full text-left" aria-label={`Voir ${product.name}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <span aria-hidden className="absolute top-2 left-4 font-serif text-[7rem] leading-none text-ink/[0.07] md:text-[10rem]">
            {String(index + 1).padStart(2, "0")}
          </span>
          {cutout && product.image ? (
            <Image src={cutout} alt={product.image.alt} fill sizes="(min-width: 768px) 46vw, 84vw" className="object-contain p-[6%] drop-shadow-[0_30px_30px_rgba(60,35,20,0.25)] transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.05] group-hover:-rotate-1" />
          ) : (
            <ProductImage image={product.image} name={product.name} sizes="(min-width: 768px) 46vw, 84vw" zoom className="absolute inset-0" />
          )}
          {orderable && (
            <span className="absolute right-4 bottom-4 inline-flex h-11 items-center bg-ink px-5 text-[0.68rem] font-bold tracking-[0.22em] text-ivory uppercase transition-all duration-500 ease-out-expo md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
              Ajouter
            </span>
          )}
        </div>
      </button>
      <div className="mt-6 flex items-baseline justify-between gap-6 border-b border-rule pb-4">
        <h3 className="font-serif text-[2.2rem] leading-none md:text-[3.2rem]">{product.name}</h3>
        <p className="font-serif text-2xl md:text-3xl">
          <Price cents={product.priceCents} />
        </p>
      </div>
      <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-sub">{product.ingredients.map((i) => i.name).join(" · ")}</p>
    </Reveal>
  );
}
