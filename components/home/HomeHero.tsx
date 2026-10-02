import Image from "next/image";
import { MapPin, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { images } from "@/data/images";
import { restaurant } from "@/data/restaurant";

const photo = images.smashSpecial;

/** Hero simple : nom, accroche, deux CTA, la meilleure vraie photo de burger. */
export function HomeHero() {
  return (
    <section aria-labelledby="home-title" className="shell grid items-center gap-6 pt-4 pb-10 md:grid-cols-2 md:gap-12 md:pt-10 md:pb-16">
      <div className="animate-fade-up md:order-1">
        <span className="inline-flex rounded-full border border-line bg-white px-3.5 py-1.5">
          <OpeningStatus className="text-[0.85rem]" />
        </span>
        <h1 id="home-title" className="mt-5 font-display text-[3.6rem] leading-[0.95] md:text-[5.2rem] lg:text-[6.2rem]">
          Burger By M
        </h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted md:text-xl">Smash burgers, Frenchy’s et recettes gourmandes à Rantigny.</p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <ButtonLink href="/menu" variant="dark" size="lg" arrow>
            Voir la carte
          </ButtonLink>
          <ButtonLink href="/commander" variant="outline" size="lg">
            Commander
          </ButtonLink>
        </div>
        <ul className="mt-7 space-y-2 text-[0.95rem] text-muted">
          <li className="flex items-center gap-2">
            <Store className="size-4 shrink-0" aria-hidden /> Retrait sur place · paiement au restaurant
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden /> {restaurant.address.street}, {restaurant.address.city}
          </li>
        </ul>
      </div>

      <div className="relative -order-1 aspect-[4/3] animate-fade-up overflow-hidden rounded-xl bg-ink [animation-delay:120ms] md:order-2 md:aspect-[4/5]">
        <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 768px) 50vw, 100vw" quality={85} className="object-cover" style={{ objectPosition: photo.position }} />
      </div>
    </section>
  );
}
