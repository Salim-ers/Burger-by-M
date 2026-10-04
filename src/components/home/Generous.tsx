"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { RevealText } from "@/components/motion";
import { media } from "@/data/media";

/** « Généreux par nature » : grande image pleine largeur, zoom maximal 1,05 au défilement. */
export function Generous() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo("[data-zoom]", { scale: 1 }, { scale: 1.05, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );
  const img = media.lineupSignatures;
  return (
    <section ref={root} data-theme="light" aria-labelledby="genereux-title" className="on-light relative h-[88svh] min-h-[560px] overflow-hidden bg-sand md:h-[100svh]">
      <div data-zoom className="absolute inset-0">
        <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: img.position }} />
      </div>
      <div className="container-bm relative flex h-full flex-col justify-between pt-28 pb-10 md:pt-32 md:pb-14">
        {/* Le titre tient dans le ciel de l'image : il ne recouvre pas les burgers. */}
        <RevealText id="genereux-title" as="h2" className="flex flex-wrap items-baseline gap-x-5" lines={[<span key="a" className="t-xl">Généreux</span>, <span key="b" className="s-xl">par nature.</span>]} />
        <p className="t-label flex flex-wrap gap-x-6 gap-y-2 text-ink/75">
          <span>Burgers.</span>
          <span>Frenchy’s.</span>
          <span>Loaded fries.</span>
          <span>Milkshakes.</span>
        </p>
      </div>
    </section>
  );
}
