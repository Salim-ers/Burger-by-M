"use client";

import Image from "next/image";
import { LineReveal, MaskReveal, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningHours, OpenStatus, UpcomingSpecials } from "@/components/store/OpeningHours";
import { useSite } from "@/features/site-context";
import { media } from "@/data/media";
import { mapsLinks } from "@/data/brand";

/** Le restaurant : vraie devanture, adresse, horaires issus de Neon, appeler / itinéraire / commander. */
export function RestaurantSection() {
  const { store } = useSite();
  const maps = mapsLinks(`${store.street}, ${store.postalCode} ${store.city}`);
  return (
    <section aria-labelledby="resto-title" className="on-light bg-paper py-24 md:py-36">
      <div className="shell grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="relative md:col-span-6 lg:col-span-5">
          <MaskReveal className="aspect-[4/5] w-full bg-sand md:aspect-[3/4]">
            <Image src={media.devanture.src} alt={media.devanture.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" style={{ objectPosition: media.devanture.position }} />
          </MaskReveal>
          <Reveal delay={0.25} className="absolute -right-4 -bottom-10 hidden w-[42%] border-[6px] border-paper shadow-lift md:block lg:-right-16">
            <div className="relative aspect-[1172/1282]">
              <Image src={media.terrasse.src} alt={media.terrasse.alt} fill sizes="20vw" className="object-cover" />
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col md:col-span-6 md:pl-6 lg:col-span-6 lg:col-start-7">
          <p className="kicker text-brass-deep">Le restaurant</p>
          <LineReveal id="resto-title" lines={[store.street, <span key="c" className="italic">{store.city}.</span>]} className="display-3 mt-5" />
          <p className="mt-6 text-[1.02rem] leading-relaxed text-sub">
            {store.postalCode} {store.city} — Oise. Sur place ou à emporter : commandez en ligne, choisissez votre heure, récupérez au comptoir.
          </p>
          <OpenStatus className="mt-8" />

          <OpeningHours className="mt-10" />
          <UpcomingSpecials className="mt-6" />

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
      </div>
    </section>
  );
}
