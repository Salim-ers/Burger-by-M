"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RevealImage, RevealText } from "@/components/motion";
import { Lightbox } from "@/components/gallery/Lightbox";
import { media, type MediaImage } from "@/data/media";
import { cn } from "@/lib/utils";

/** Galerie éditoriale asymétrique : une grande, deux verticales, une large, un gros plan — décalées. */
const SHOTS: { img: MediaImage; frame: string; box: string }[] = [
  { img: media.fritesCheddarOignons, frame: "aspect-[3/2]", box: "md:col-span-7" },
  { img: media.milkshakePistache, frame: "aspect-[3/4]", box: "md:col-span-3 md:mt-32" },
  { img: media.realLeHot, frame: "aspect-[3/4]", box: "md:col-span-2 md:mt-64" },
  { img: media.lineupDark, frame: "aspect-[16/9]", box: "md:col-span-8 md:col-start-2" },
  { img: media.realForestier, frame: "aspect-[16/10]", box: "md:col-span-3 md:mt-40" },
];

export function GalleryHome() {
  const [index, setIndex] = useState<number | null>(null);
  const images = SHOTS.map((s) => s.img);
  return (
    <section data-theme="light" aria-labelledby="galerie-title" className="on-cream bg-cream py-[var(--space-xl)]">
      <div className="container-bm">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <RevealText id="galerie-title" as="h2" lines={[<span key="a" className="t-xl">Vu de</span>, <span key="b" className="s-xl">près.</span>]} />
          <Link href="/galerie" className="t-label border-b border-ink/30 pb-1 transition-colors hover:border-cheddar hover:text-cheddar-deep">
            Toute la galerie →
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
          {SHOTS.map((s, i) => (
            <button key={s.img.src} type="button" data-cursor="open" onClick={() => setIndex(i)} className={cn("group block text-left", i === 0 || i === 3 ? "col-span-2" : "col-span-1", s.box)} aria-label={`Agrandir : ${s.img.alt}`}>
              <RevealImage className={cn("w-full bg-sand", s.frame)} panel="var(--cream)">
                <Image src={s.img.src} alt={s.img.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-food)] group-hover:scale-[1.03]" style={s.img.position ? { objectPosition: s.img.position } : undefined} />
              </RevealImage>
            </button>
          ))}
        </div>
      </div>
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
