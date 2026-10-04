"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn, RevealImage, RevealText } from "@/components/motion";
import { OpeningHours, OpenStatus, UpcomingSpecials } from "./OpeningHours";
import { MapEmbed } from "./MapEmbed";
import { useSite } from "@/features/site-context";
import { useOrderingNotice, ORDERING_CLOSED_LABEL } from "@/features/store/use-status";
import { mapsLinks } from "@/data/brand";
import { media } from "@/data/media";
import type { WeeklyRange } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const WORDS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept"];

/** « six jours sur sept. » calculé depuis les horaires en base. */
function openDaysLabel(weekly: WeeklyRange[]) {
  const n = new Set(weekly.map((r) => r.dayOfWeek)).size;
  if (n === 7) return "tous les jours.";
  if (n === 0) return "bientôt.";
  return `${WORDS[n]} jour${n > 1 ? "s" : ""} sur sept.`;
}

/** /restaurant : la vraie devanture, l'adresse en grand, horaires en direct (Neon), plan (après accord), terrasse. */
export function RestaurantView() {
  const { store } = useSite();
  const notice = useOrderingNotice();
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const maps = mapsLinks(address);
  const reviews = store.googleReviewsUrl ?? maps.search;
  // « 19 avenue » (brut) / « de la Gare. » (éditorial)
  const [num = "", ...rest] = store.street.split(" ");
  const numbered = /^\d/.test(num) && rest.length > 1;

  return (
    <>
      <section data-theme="dark" className="on-dark bg-ink pt-28 pb-[var(--space-lg)] md:pt-36">
        <div className="container-bm grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="t-label hero-fade text-cheddar">Le restaurant · Rantigny, Oise</p>
            <h1 className="mt-6">
              {numbered ? (
                <>
                  <span className="mask-line hero-line" style={{ "--i": 0 } as React.CSSProperties}>
                    <span className="t-xxl">
                      {num} {rest[0]}
                    </span>
                  </span>
                  <span className="mask-line hero-line" style={{ "--i": 1 } as React.CSSProperties}>
                    <span className="s-xxl">{rest.slice(1).join(" ")}.</span>
                  </span>
                </>
              ) : (
                <span className="mask-line hero-line">
                  <span className="t-xxl">{store.street}.</span>
                </span>
              )}
            </h1>
            <p className="hero-fade t-s mt-6 text-cream/70">
              {store.postalCode} {store.city} · près de Creil, Liancourt et Clermont
            </p>
            <OpenStatus className="hero-fade mt-8" />
            <div className="hero-fade mt-10 flex flex-wrap gap-2">
              <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="t-label inline-flex h-14 items-center bg-cream px-7 text-ink transition-colors hover:bg-cheddar">
                Itinéraire
              </a>
              <a href={store.phoneHref} className="t-label inline-flex h-14 items-center border border-cream/30 px-7 transition-colors hover:border-cream">
                Appeler · {store.phone}
              </a>
              <Link href="/menu" className={cn("t-label inline-flex h-14 items-center px-7 transition-colors", notice ? "border border-cream/20 text-sub" : "bg-cheddar text-ink hover:bg-cream")}>
                {notice ? ORDERING_CLOSED_LABEL : "Commander"}
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <RevealImage className="aspect-[4/5] w-full bg-charcoal" panel="var(--ink)">
              <Image src={media.devanture.src} alt={media.devanture.alt} fill preload sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: media.devanture.position }} />
            </RevealImage>
          </div>
        </div>
      </section>

      <section data-theme="light" aria-labelledby="horaires-title" className="on-light bg-ivory py-[var(--space-xl)]">
        <div className="container-bm grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="t-label text-cheddar-deep">Horaires</p>
            <RevealText id="horaires-title" as="h2" className="mt-5" lines={[<span key="a" className="t-xl">Ouvert</span>, <span key="b" className="s-xl">{openDaysLabel(store.schedule.weekly)}</span>]} />
            <p className="mt-6 max-w-sm leading-relaxed text-sub">Sur place ou à emporter. Commandez en ligne, choisissez votre heure de retrait : votre commande est préparée pour ce moment-là.</p>
            <a href={store.phoneHref} className="t-m mt-8 inline-block underline decoration-ink/20 underline-offset-8 transition-colors hover:decoration-cheddar">
              {store.phone}
            </a>
          </div>
          <FadeIn className="md:col-span-6 md:col-start-7">
            <OpeningHours />
            <UpcomingSpecials className="mt-6" />
          </FadeIn>
        </div>
      </section>

      <section data-theme="light" aria-labelledby="acces-title" className="on-cream bg-cream py-[var(--space-xl)]">
        <div className="container-bm grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="t-label text-cheddar-deep">Accès</p>
            <h2 id="acces-title" className="mt-5">
              <span className="t-l block">Venir</span>
              <span className="s-l block">jusqu’à nous.</span>
            </h2>
            <address className="mt-6 leading-relaxed text-sub not-italic">
              {store.name}
              <br />
              {address}
            </address>
            <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="t-label mt-8 inline-flex h-12 items-center bg-ink px-6 text-cream transition-colors hover:bg-cheddar hover:text-ink">
              Calculer l’itinéraire
            </a>
            <a href={reviews} target="_blank" rel="noopener noreferrer" className="mt-8 block w-fit border-b border-ink/25 pb-1 text-[0.95rem] text-sub transition-colors hover:border-cheddar hover:text-fg">
              Les avis de nos clients sont sur Google →
            </a>
          </div>
          <MapEmbed address={address} className="aspect-[4/3] md:col-span-8 md:aspect-[16/9]" />
        </div>
      </section>

      <section data-theme="dark" aria-labelledby="terrasse-title" className="on-charcoal bg-charcoal py-[var(--space-xl)]">
        <div className="container-bm grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5 md:col-start-2">
            <p className="t-label text-cheddar">Aux beaux jours</p>
            <RevealText id="terrasse-title" as="h2" className="mt-5" lines={[<span key="a" className="t-xl">La</span>, <span key="b" className="s-xl">terrasse.</span>]} />
            <p className="mt-6 max-w-sm leading-relaxed text-cream/70">Tables dehors, au calme, pour manger chaud sans attendre d’être rentré.</p>
          </div>
          <div className="md:col-span-5">
            <RevealImage className="aspect-[1172/1282] w-full bg-ink" panel="var(--charcoal)" parallax={4}>
              <Image src={media.terrasse.src} alt={media.terrasse.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: media.terrasse.position }} />
            </RevealImage>
          </div>
        </div>
      </section>
    </>
  );
}
