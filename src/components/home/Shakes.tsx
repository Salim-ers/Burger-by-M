"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { RevealImage, RevealText } from "@/components/motion";
import { useSite } from "@/features/site-context";
import { useUi } from "@/features/cart/store";
import { isOrderable } from "@/features/menu/types";
import { Price } from "@/components/ui/Price";
import { media } from "@/data/media";

/**
 * Milkshakes & desserts : rupture lumineuse. Le fond glisse discrètement de la pistache au caramel
 * puis au chocolat. Les visuels sont les vraies photos des shakes (crop éditorial, pas de lévitation).
 */
export function Shakes() {
  const root = useRef<HTMLElement>(null);
  const { menu } = useSite();
  const open = useUi((s) => s.openProduct);
  const desserts = menu.find((c) => c.slug === "desserts")?.products ?? [];

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 30%", scrub: 0.6 } })
        .fromTo(root.current, { backgroundColor: "#e6e8d3" }, { backgroundColor: "#f1dfc4", ease: "none" })
        .to(root.current, { backgroundColor: "#e9d8cb", ease: "none" });
    },
    { scope: root },
  );

  if (desserts.length === 0) return null;
  return (
    <section ref={root} data-theme="light" aria-labelledby="shakes-title" className="on-cream relative overflow-hidden bg-[#efe3cf] py-[var(--space-xl)]">
      <div className="container-bm grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="t-label text-cheddar-deep">Milkshakes &amp; desserts</p>
          <RevealText id="shakes-title" as="h2" className="mt-6" lines={[<span key="a" className="t-xl">Pistache.</span>, <span key="b" className="s-xl">Caramel.</span>, <span key="c" className="t-xl">Chocolat.</span>]} />
          <ul className="mt-12 divide-y divide-ink/12 border-y border-ink/12">
            {desserts.map((p) => (
              <li key={p.id}>
                <button type="button" data-cursor="add" onClick={() => open(p.id)} className="group flex w-full items-baseline justify-between gap-6 py-4 text-left">
                  <span>
                    <span className="t-s block transition-transform duration-500 group-hover:translate-x-1">{p.name}</span>
                    {p.description && <span className="mt-1 block text-sm text-sub">{p.description}</span>}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-4">
                    <span className="t-s transition-colors group-hover:text-cheddar-deep">
                      <Price cents={p.priceCents} />
                    </span>
                    {isOrderable(p) && <span className="t-label hidden text-sub transition-colors group-hover:text-ink sm:inline">Ajouter +</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-6 md:col-start-7">
          <figure>
            <RevealImage className="aspect-[3/5] w-full bg-sand" panel="#efe3cf" direction="up">
              <Image src={media.milkshakePistache.src} alt={media.milkshakePistache.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" style={{ objectPosition: media.milkshakePistache.position }} />
            </RevealImage>
            <figcaption className="t-label mt-3 text-sub">Dubai Shake · photo réelle</figcaption>
          </figure>
          <figure className="mt-24">
            <RevealImage className="aspect-[3/5] w-full bg-sand" panel="#efe3cf" direction="up">
              <Image src={media.milkshakeCaramel.src} alt={media.milkshakeCaramel.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" style={{ objectPosition: media.milkshakeCaramel.position }} />
            </RevealImage>
            <figcaption className="t-label mt-3 text-sub">Milkshake à composer · exemple</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
