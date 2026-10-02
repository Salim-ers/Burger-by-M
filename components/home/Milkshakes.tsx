"use client";

import Image from "next/image";
import { useRef } from "react";
import { RevealText } from "@/components/animations/RevealText";
import { Parallax } from "@/components/animations/Parallax";
import { AddButton } from "@/components/product/AddButton";
import { Price } from "@/components/ui/Price";
import { useProduct } from "@/hooks/use-menu";
import { images } from "@/data/images";
import type { Product } from "@/types/product";

const SHAKES = ["dubai-shake", "bueno-bomb", "milkshake-a-composer"];

function ShakeLine({ id }: { id: string }) {
  const product = useProduct(id) as Product;
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li ref={ref} className="flex items-center justify-between gap-5 border-t border-ink/15 py-6">
      <div className="min-w-0">
        <p className="font-display text-3xl leading-none uppercase md:text-4xl">{product.name}</p>
        <p className="mt-2 max-w-sm text-sm leading-snug text-ink/70">{product.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="font-display text-2xl tabular-nums md:text-3xl">
          <Price cents={product.price} />
        </span>
        <AddButton product={product} tone="light" sourceRef={ref} />
      </div>
    </li>
  );
}

/** Changement de palette volontaire : rose poudré, caramel et chocolat. */
export function Milkshakes() {
  return (
    <section aria-labelledby="shake-title" className="relative overflow-hidden bg-rose py-28 text-ink md:py-40">
      <div className="container-site grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="relative h-[560px] md:col-span-6 md:h-[760px]">
          <Blobs />
          <Parallax offset={50} className="absolute top-0 left-0 w-[58%]">
            <div className="relative aspect-[720/1186] -rotate-[5deg] overflow-hidden rounded-xs shadow-float">
              <Image src={images.dubaiShake.src} alt={images.dubaiShake.alt} fill sizes="(min-width: 768px) 30vw, 58vw" className="object-cover" />
            </div>
          </Parallax>
          <Parallax offset={-40} className="absolute right-0 bottom-0 w-[52%]">
            <div className="relative aspect-[720/1186] rotate-[4deg] overflow-hidden rounded-xs shadow-float">
              <Image src={images.shakeCaramel.src} alt={images.shakeCaramel.alt} fill sizes="(min-width: 768px) 26vw, 52vw" className="object-cover" />
            </div>
          </Parallax>
        </div>

        <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
          <RevealText id="shake-title" lines={["Shake", "it."]} className="font-display text-mega font-medium uppercase" />
          <p className="mt-8 max-w-sm text-lg leading-relaxed text-ink/75">Pistache, Kinder Bueno, Oreo, caramel. Le dessert qui se boit à la paille.</p>
          <ul className="mt-10 border-b border-ink/15">
            {SHAKES.map((id) => (
              <ShakeLine key={id} id={id} />
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink/60">Toppings : Kinder Bueno White, Kinder Bueno, Oreo, Speculoos. Coulis : caramel, chocolat, Nutella.</p>
        </div>
      </div>
    </section>
  );
}

function Blobs() {
  return (
    <svg aria-hidden viewBox="0 0 600 760" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
      {/* Caramel */}
      <path
        fill="#b9702a"
        d="M420 120c70 10 130 70 120 150-8 62-60 86-58 150 2 58 40 72 30 118-12 52-80 60-110 18-24-34-6-72-40-104-40-38-118-10-150-70-34-62 20-150 90-200 40-28 78-68 118-62Z"
        opacity="0.85"
      />
      {/* Coulure */}
      <path fill="#b9702a" d="M470 560c8 0 14 10 14 40s-6 70-14 70-14-40-14-70 6-40 14-40Z" opacity="0.85" />
      {/* Chocolat */}
      <path
        fill="#3b2418"
        d="M90 470c50-30 130-20 160 30 26 44 6 100-40 130-50 32-120 40-150 0-28-38-20-130 30-160Z"
        opacity="0.9"
      />
      <circle cx="140" cy="140" r="26" fill="#faf6ed" opacity="0.7" />
    </svg>
  );
}
