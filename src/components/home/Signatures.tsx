"use client";

import Image from "next/image";
import Link from "next/link";
import { useSite } from "@/features/site-context";
import { useUi } from "@/features/cart/store";
import { isOrderable, type MenuProduct } from "@/features/menu/types";
import { RevealImage, RevealText, FadeIn } from "@/components/motion";
import { Price } from "@/components/ui/Price";
import { media, type MediaImage } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * Nos signatures — composition asymétrique (pas une grille de cartes identiques).
 * Visuels : photo de la carte ou VRAIE photo du produit au restaurant quand elle existe.
 */
const LAYOUT: { slug: string; photo?: MediaImage; frame: string; box: string; caption?: string }[] = [
  { slug: "smash-double", frame: "aspect-[16/10]", box: "md:col-span-8" },
  { slug: "le-special", photo: media.realSpecial, frame: "aspect-[3/4]", box: "md:col-span-4 md:mt-40", caption: "Photo réelle" },
  { slug: "le-montagnard", frame: "aspect-[4/3]", box: "md:col-span-7 md:-mt-24" },
  { slug: "spicy-chicken", photo: media.realSpicyChicken, frame: "aspect-square", box: "md:col-span-4 md:col-start-9 md:mt-24", caption: "Photo réelle" },
];

export function Signatures() {
  const { products } = useSite();
  const all = [...products.values()];
  const items = LAYOUT.map((l) => ({ ...l, product: all.find((p) => p.slug === l.slug) })).filter((l): l is (typeof LAYOUT)[number] & { product: MenuProduct } => Boolean(l.product));
  if (items.length === 0) return null;

  return (
    <section id="signatures" data-theme="light" aria-labelledby="signatures-title" className="on-light scroll-mt-16 bg-ivory py-[var(--space-xl)]">
      <div className="container-bm">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <RevealText id="signatures-title" as="h2" lines={[<span key="a" className="t-xl">Nos</span>, <span key="b" className="s-xxl">signatures.</span>]} />
          <Link href="/menu" className="t-label border-b border-ink/30 pb-1 transition-colors hover:border-cheddar hover:text-cheddar-deep">
            Toute la carte →
          </Link>
        </div>
        <div className="mt-16 grid gap-x-6 gap-y-16 md:mt-24 md:grid-cols-12">
          {items.map((it, i) => (
            <SignatureCard key={it.slug} index={i} product={it.product} photo={it.photo ?? it.product.image} frame={it.frame} className={it.box} caption={it.caption} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SignatureCard({ product, photo, index, frame, className, caption }: { product: MenuProduct; photo: { src: string; alt: string; position?: string } | null; index: number; frame: string; className?: string; caption?: string }) {
  const open = useUi((s) => s.openProduct);
  const orderable = isOrderable(product);
  const short = product.ingredients.slice(0, 4).map((i) => i.name).join(" · ");
  return (
    <FadeIn as="div" className={cn("group", className)} y={40}>
      <button type="button" data-cursor={orderable ? "add" : "view"} onClick={() => open(product.id)} className="block w-full text-left" aria-label={`${product.name} — ${orderable ? "personnaliser et ajouter" : "voir le produit"}`}>
        <RevealImage className={cn("w-full bg-sand", frame)} panel="var(--ivory)">
          {photo && <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-food)] group-hover:scale-[1.035]" style={photo.position ? { objectPosition: photo.position } : undefined} />}
        </RevealImage>
        <div className="mt-5 flex items-start justify-between gap-6 border-b border-rule pb-4">
          <div className="min-w-0">
            <p className="t-label text-sub tabular-nums">
              {String(index + 1).padStart(2, "0")}
              {caption && <span className="ml-3 text-sub/70">· {caption}</span>}
            </p>
            <h3 className="t-m mt-2 transition-transform duration-500 ease-[var(--ease-food)] group-hover:translate-x-1.5">{product.name}</h3>
            <p className="mt-2 text-[0.92rem] text-sub">{short}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <p className="t-s transition-colors duration-500 group-hover:text-cheddar-deep">
              <Price cents={product.priceCents} />
            </p>
            {orderable && (
              <span className="t-label inline-flex h-10 items-center bg-ink px-4 text-cream transition-[opacity,transform,background-color] duration-500 ease-[var(--ease-food)] group-hover:bg-cheddar group-hover:text-ink md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                Ajouter +
              </span>
            )}
          </div>
        </div>
      </button>
    </FadeIn>
  );
}
