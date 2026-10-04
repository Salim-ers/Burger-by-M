"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { RevealText } from "@/components/motion";
import { useSite } from "@/features/site-context";
import { useUi } from "@/features/cart/store";
import { compositionText, isOrderable, type MenuProduct } from "@/features/menu/types";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";

/**
 * Frenchy’s : changement de rythme. Une grande photo paysage traverse ~65 % de l'écran ; au défilement,
 * le nom change et la photo suivante se dévoile (fondu + volet horizontal). Mobile : pile éditoriale simple.
 */
export function Frenchys() {
  const { menu } = useSite();
  const items = (menu.find((c) => c.slug === "frenchys")?.products ?? []).filter((p) => p.image);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // Mouvement réduit : pas de scène au défilement, les noms se touchent pour changer de photo.
  const [still, setStill] = useState(false);

  useGSAP(
    () => {
      if (reducedMotion()) {
        setStill(true);
        return;
      }
      if (items.length < 2 || !window.matchMedia("(min-width: 1024px)").matches) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (st) => {
            const i = Math.min(items.length - 1, Math.floor(st.progress * items.length * 0.999));
            setActive((cur) => (cur === i ? cur : i));
          },
        },
      });
      items.slice(1).forEach((_, k) => {
        const i = k + 1;
        tl.fromTo(`[data-shot='${i}']`, { clipPath: "inset(0% 0% 0% 100%)", opacity: 0.4 }, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1, ease: "power2.inOut" }, i - 0.5);
        tl.fromTo(`[data-shot='${i}'] img`, { scale: 1.08 }, { scale: 1, duration: 1, ease: "power2.out" }, i - 0.5);
      });
    },
    { scope: root, dependencies: [items.length] },
  );

  if (items.length === 0) return null;
  const cur = items[active] ?? items[0]!;

  return (
    <section ref={root} data-theme="dark" aria-labelledby="frenchys-title" className={cn("on-charcoal relative bg-charcoal", !still && "lg:h-[360vh]")}>
      {/* Desktop : scène collante */}
      <div className="hidden h-svh lg:sticky lg:top-0 lg:flex">
        <div className="relative h-full w-[64%] overflow-hidden bg-sand">
          {items.map((p, i) => (
            <div key={p.id} data-shot={i} className="absolute inset-0 transition-opacity duration-300" style={still ? { opacity: i === active ? 1 : 0 } : i === 0 ? undefined : { clipPath: "inset(0% 0% 0% 100%)" }}>
              <Image src={p.image!.src} alt={p.image!.alt} fill sizes="64vw" className="object-cover" style={{ objectPosition: "50% 55%" }} />
            </div>
          ))}
          <p className="t-label absolute bottom-6 left-6 z-10 bg-ink/70 px-3 py-2 text-cream backdrop-blur">Baguette briochée</p>
        </div>
        <div className="flex w-[36%] flex-col justify-between px-[clamp(1.5rem,3vw,3.5rem)] pt-32 pb-12">
          <div>
            <p className="t-label text-cheddar">Les Frenchy’s</p>
            <RevealText id="frenchys-title" as="h2" className="mt-5" lines={[<span key="a" className="t-l">Long.</span>, <span key="b" className="s-l">Généreux.</span>, <span key="c" className="t-l">Briochés.</span>]} />
          </div>
          <ol className="space-y-1" aria-label="Les Frenchy’s">
            {items.map((p, i) => (
              <li key={p.id} className={cn("t-m transition-colors duration-500", i === active ? "text-cream" : "text-cream/25")}>
                <span className="t-label mr-4 align-middle tabular-nums text-cheddar">{String(i + 1).padStart(2, "0")}</span>
                {still ? (
                  <button type="button" onClick={() => setActive(i)} aria-pressed={i === active} className="uppercase hover:text-cream">
                    {p.name}
                  </button>
                ) : (
                  p.name
                )}
              </li>
            ))}
          </ol>
          <FrenchyDetail key={cur.id} product={cur} />
        </div>
      </div>

      {/* Mobile / tablette : pile éditoriale */}
      <div className="py-[var(--space-xl)] lg:hidden">
        <div className="container-bm">
          <p className="t-label text-cheddar">Les Frenchy’s</p>
          <h2 className="mt-5">
            <span className="t-l block">Long.</span>
            <span className="s-l block">Généreux.</span>
            <span className="t-l block">Briochés.</span>
          </h2>
        </div>
        <ul className="mt-12 space-y-14">
          {items.map((p, i) => (
            <li key={p.id}>
              <div className="relative aspect-[3/2] w-full bg-sand">
                <Image src={p.image!.src} alt={p.image!.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="container-bm mt-5">
                <p className="t-label text-cheddar tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <FrenchyDetail product={p} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FrenchyDetail({ product }: { product: MenuProduct }) {
  const open = useUi((s) => s.openProduct);
  const orderable = isOrderable(product);
  return (
    <div className="animate-[soft-in_0.5s_var(--ease-food)_both] border-t border-rule pt-5">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="t-m">{product.name}</h3>
        <p className="t-s text-cheddar">
          <Price cents={product.priceCents} />
        </p>
      </div>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-cream/70">{compositionText(product)}</p>
      <button type="button" data-cursor="add" onClick={() => open(product.id)} className="t-label mt-5 inline-flex h-12 items-center bg-cream px-6 text-ink transition-colors hover:bg-cheddar">
        {orderable ? "Ajouter +" : "Voir le produit"}
      </button>
    </div>
  );
}
