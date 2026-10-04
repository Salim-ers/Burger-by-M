"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealImage, RevealText } from "@/components/motion";
import { OpeningHours, OpenStatus, UpcomingSpecials } from "@/components/store/OpeningHours";
import { useSite } from "@/features/site-context";
import { useOrderingNotice, ORDERING_CLOSED_LABEL } from "@/features/store/use-status";
import { mapsLinks } from "@/data/brand";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";

/** « Ici, c'est Rantigny. » — la vraie devanture, l'adresse, les horaires (Neon), appeler / itinéraire / commander. */
export function RestaurantHome() {
  const { store } = useSite();
  const notice = useOrderingNotice();
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const maps = mapsLinks(address);
  const reviews = store.googleReviewsUrl ?? maps.search;
  return (
    <section data-theme="dark" aria-labelledby="ici-title" className="on-charcoal bg-charcoal py-[var(--space-xl)]">
      <div className="container-bm grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <RevealImage className="aspect-[4/5] w-full bg-ink" panel="var(--charcoal)" parallax={4}>
            <Image src={media.devanture.src} alt={media.devanture.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: media.devanture.position }} />
          </RevealImage>
        </div>
        <div className="flex flex-col md:col-span-6 md:col-start-7">
          <p className="t-label text-cheddar">Le restaurant</p>
          <RevealText id="ici-title" as="h2" className="mt-6" lines={[<span key="a" className="t-xl">Ici,</span>, <span key="b" className="s-xl">c’est Rantigny.</span>]} />
          <address className="mt-10 not-italic">
            <p className="t-m">{store.name}</p>
            <p className="mt-3 text-[1.05rem] text-cream/75">
              {store.street}
              <br />
              {store.postalCode} {store.city}
            </p>
            <a href={store.phoneHref} className="t-s mt-4 inline-block underline decoration-white/25 underline-offset-8 hover:decoration-cheddar">
              {store.phone}
            </a>
          </address>
          <OpenStatus className="mt-8" />
          <OpeningHours className="mt-6" tone="dark" />
          <UpcomingSpecials className="mt-6" />
          <div className="mt-10 flex flex-wrap gap-2">
            <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="t-label inline-flex h-14 items-center bg-cream px-7 text-ink transition-colors hover:bg-cheddar">
              Itinéraire
            </a>
            <a href={store.phoneHref} className="t-label inline-flex h-14 items-center border border-cream/30 px-7 transition-colors hover:border-cream">
              Appeler
            </a>
            <Link href="/menu" className={cn("t-label inline-flex h-14 items-center px-7 transition-colors", notice ? "border border-cream/20 text-sub" : "bg-cheddar text-ink hover:bg-cream")}>
              {notice ? ORDERING_CLOSED_LABEL : "Commander"}
            </Link>
          </div>
          <a href={reviews} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-3 self-start border-b border-cream/25 pb-1 text-[0.95rem] text-cream/80 transition-colors hover:border-cheddar hover:text-cream">
            Les avis de nos clients sont sur Google →
          </a>
        </div>
      </div>
    </section>
  );
}
