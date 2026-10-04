"use client";

import Image from "next/image";
import { LineReveal, MaskReveal, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningHours, OpenStatus, UpcomingSpecials } from "./OpeningHours";
import { MapEmbed } from "./MapEmbed";
import { useSite } from "@/features/site-context";
import { mapsLinks } from "@/data/brand";
import { media } from "@/data/media";
import type { WeeklyRange } from "@/lib/schedule";

const WORDS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept"];

/** « six jours sur sept. » calculé depuis les horaires en base. */
function openDaysLabel(weekly: WeeklyRange[]) {
  const n = new Set(weekly.map((r) => r.dayOfWeek)).size;
  if (n === 7) return "tous les jours.";
  if (n === 0) return "bientôt.";
  return `${WORDS[n]} jour${n > 1 ? "s" : ""} sur sept.`;
}

/** /restaurant : adresse, horaires en direct (Neon), appeler / itinéraire / commander, plan. */
export function RestaurantView() {
  const { store } = useSite();
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const maps = mapsLinks(address);
  return (
    <>
      <section className="on-light bg-ivory pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="kicker text-brass-deep">Le restaurant · Rantigny</p>
            <h1 className="display-2 soft-in mt-6 max-w-[11ch]" style={{ "--d": "0.1s" } as React.CSSProperties}>
              {store.street}
              <span className="text-brass">.</span>
            </h1>
            <p className="mt-6 font-serif text-2xl italic md:text-3xl">
              {store.postalCode} {store.city} — Oise
            </p>
            <OpenStatus className="mt-8" />
            <div className="mt-10 flex flex-wrap gap-2">
              <ButtonLink href={store.phoneHref} variant="ink" size="lg">
                Appeler
              </ButtonLink>
              <ButtonLink href={maps.directions} variant="line" size="lg">
                Itinéraire
              </ButtonLink>
              <ButtonLink href="/menu" variant="line" size="lg" arrow>
                Commander
              </ButtonLink>
            </div>
          </div>
          <div className="md:col-span-5">
            <MaskReveal className="aspect-[4/5] w-full bg-sand">
              <Image src={media.devanture.src} alt={media.devanture.alt} fill preload sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: media.devanture.position }} />
            </MaskReveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="horaires-title" className="on-light border-t border-rule bg-paper py-20 md:py-28">
        <div className="shell grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="kicker text-brass-deep">Horaires</p>
            <LineReveal id="horaires-title" lines={["Ouvert", <span key="i" className="italic">{openDaysLabel(store.schedule.weekly)}</span>]} className="display-3 mt-5" />
            <p className="mt-6 max-w-sm text-sub">Sur place ou à emporter. Commandez en ligne, choisissez votre heure de retrait : votre commande est préparée pour ce moment-là.</p>
            <a href={store.phoneHref} className="mt-8 inline-block font-serif text-3xl underline decoration-ink/20 underline-offset-8 hover:decoration-ink">
              {store.phone}
            </a>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <OpeningHours />
            <UpcomingSpecials className="mt-6" />
          </div>
        </div>
      </section>

      <section aria-labelledby="acces-title" className="on-light bg-ivory py-20 md:py-28">
        <div className="shell grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="kicker text-brass-deep">Accès</p>
            <h2 id="acces-title" className="display-4 mt-5">
              Venir <span className="italic">jusqu’à nous.</span>
            </h2>
            <p className="mt-5 text-sub">{address}</p>
            <ButtonLink href={maps.directions} variant="ghost" size="md" arrow className="mt-6">
              Calculer l’itinéraire
            </ButtonLink>
          </div>
          <MapEmbed address={address} className="aspect-[4/3] md:col-span-8 md:aspect-[16/9]" />
        </div>
      </section>

      <section aria-label="La terrasse" className="on-dark relative isolate overflow-hidden bg-ink">
        <Image src={media.terrasse.src} alt={media.terrasse.alt} fill sizes="100vw" className="-z-10 object-cover opacity-60" style={{ objectPosition: media.terrasse.position }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="shell flex min-h-[70svh] flex-col justify-end py-16 md:py-24">
          <Reveal>
            <p className="kicker text-brass">Aux beaux jours</p>
            <p className="display-2 mt-5">
              La <span className="italic">terrasse.</span>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
