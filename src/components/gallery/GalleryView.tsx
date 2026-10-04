"use client";

import Image from "next/image";
import { useState } from "react";
import { RevealImage } from "@/components/motion";
import { Lightbox } from "./Lightbox";
import { media, type MediaImage } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * Galerie éditoriale asymétrique : chaque photo garde son cadrage d'origine (aucun recadrage),
 * l'asymétrie vient des largeurs et des décalages. Mobile : verticales par paires, horizontales en pleine largeur.
 */
const LAYOUT: { img: MediaImage; box: string }[] = [
  { img: media.realSpecial, box: "md:col-span-4 md:col-start-1" },
  { img: media.fritesCheddarOignons, box: "md:col-span-7 md:col-start-6 md:mt-40" },
  { img: media.leMontagnard, box: "md:col-span-6 md:col-start-2" },
  { img: media.devanture, box: "md:col-span-3 md:col-start-9 md:mt-24" },
  { img: media.milkshakePistache, box: "md:col-span-3 md:col-start-1 md:mt-16" },
  { img: media.leHot, box: "md:col-span-7 md:col-start-5" },
  { img: media.smashTower, box: "md:col-span-5 md:col-start-1" },
  { img: media.realSpicyChicken, box: "md:col-span-3 md:col-start-7 md:mt-32" },
  { img: media.terrasse, box: "md:col-span-3 md:col-start-10 md:mt-12" },
  { img: media.realLeHot, box: "md:col-span-4 md:col-start-2" },
  { img: media.barbeuc, box: "md:col-span-6 md:col-start-7 md:mt-36" },
  { img: media.milkshakeCaramel, box: "md:col-span-3 md:col-start-1 md:mt-12" },
  { img: media.leForestier, box: "md:col-span-6 md:col-start-4" },
  { img: media.plateau, box: "md:col-span-3 md:col-start-10 md:mt-40" },
  { img: media.fritesClassiques, box: "md:col-span-7 md:col-start-2" },
  { img: media.realForestier, box: "md:col-span-4 md:col-start-9 md:mt-28" },
];

const IMAGES = LAYOUT.map((l) => l.img);

export function GalleryView() {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section data-theme="dark" aria-labelledby="galerie-title" className="on-dark bg-ink pt-28 pb-[var(--space-xl)] md:pt-40">
      <div className="container-bm">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-label hero-fade text-cheddar">Galerie</p>
            <h1 id="galerie-title" className="mt-6">
              <span className="mask-line hero-line" style={{ "--i": 0 } as React.CSSProperties}>
                <span className="t-xxl">Vu de</span>
              </span>
              <span className="mask-line hero-line" style={{ "--i": 1 } as React.CSSProperties}>
                <span className="s-xxl">près.</span>
              </span>
            </h1>
          </div>
          <p className="hero-fade max-w-xs text-sm leading-relaxed text-cream/60">Photos prises au restaurant et visuels de la carte. Touchez une image pour l’agrandir.</p>
        </div>

        <div className="mt-16 grid grid-flow-row-dense grid-cols-2 items-start gap-3 md:mt-24 md:grid-flow-row md:grid-cols-12 md:gap-x-6 md:gap-y-10">
          {LAYOUT.map(({ img, box }, i) => {
            const landscape = img.width > img.height * 1.15;
            return (
              <figure key={img.src} className={cn(landscape ? "col-span-2" : "col-span-1", box)}>
                <button type="button" data-cursor="open" onClick={() => setIndex(i)} className="group block w-full text-left" aria-label={`Agrandir : ${img.alt}`}>
                  <RevealImage className="w-full bg-charcoal" style={{ aspectRatio: `${img.width} / ${img.height}` }} panel="var(--ink)">
                    <Image src={img.src} alt={img.alt} fill sizes={landscape ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 768px) 30vw, 50vw"} loading={i < 2 ? "eager" : undefined} className="object-cover transition-transform duration-700 ease-food group-hover:scale-[1.03]" />
                  </RevealImage>
                </button>
                <figcaption className="t-label mt-3 text-[0.6rem] text-cream/40 tabular-nums">{String(i + 1).padStart(2, "0")}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
      <Lightbox images={IMAGES} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
