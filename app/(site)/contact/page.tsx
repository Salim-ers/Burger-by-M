import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Navigation, Phone, Store } from "lucide-react";
import { ContactForm } from "@/components/restaurant/ContactForm";
import { HoursTable } from "@/components/restaurant/HoursTable";
import { MapEmbed } from "@/components/restaurant/MapEmbed";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { images } from "@/data/images";
import { directionsUrl, restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & restaurant",
  description: "Burger By M, 19 avenue de la Gare, 60290 Rantigny. Téléphone 03 44 24 89 18, horaires, itinéraire et commande à emporter.",
  path: "/contact",
});

const front = images.storefront;

export default function ContactPage() {
  return (
    <>
      <header className="shell pt-8 pb-6 md:pt-12 md:pb-8">
        <h1 className="font-display text-[3rem] leading-none md:text-[4.2rem]">Le restaurant</h1>
        <p className="mt-3 text-muted">À emporter, commande en ligne et retrait sur place.</p>
      </header>

      <div className="shell grid gap-6 pb-10 lg:grid-cols-2 lg:gap-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:aspect-auto lg:min-h-[520px]">
          <Image src={front.src} alt={front.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" quality={80} className="object-cover" style={{ objectPosition: "50% 42%" }} />
        </div>
        <div className="rounded-xl border border-line bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold">Burger By M</h2>
          <OpeningStatus className="mt-3" />
          <ul className="mt-6 space-y-3 text-[1.02rem]">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
              <address className="not-italic">
                {restaurant.address.street}
                <br />
                {restaurant.address.postalCode} {restaurant.address.city}
              </address>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 shrink-0" aria-hidden />
              <a href={restaurant.phone.href} className="font-semibold tabular-nums hover:underline">
                {restaurant.phone.display}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Store className="size-5 shrink-0" aria-hidden /> À emporter · retrait sur place
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href={directionsUrl} variant="dark" size="lg">
              <Navigation className="size-4" aria-hidden /> Itinéraire
            </ButtonLink>
            <ButtonLink href={restaurant.phone.href} variant="outline" size="lg">
              <Phone className="size-4" aria-hidden /> Appeler
            </ButtonLink>
            <ButtonLink href="/commander" variant="outline" size="lg">
              Commander
            </ButtonLink>
          </div>
          <h3 className="mt-8 mb-2 font-bold">Horaires</h3>
          <HoursTable />
        </div>
      </div>

      <div className="shell grid gap-6 pb-16 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="map-title">
          <h2 id="map-title" className="mb-3 text-xl font-bold">
            Plan d’accès
          </h2>
          <MapEmbed />
        </section>
        <section aria-labelledby="form-title" className="rounded-xl border border-line bg-white p-6 md:p-8">
          <h2 id="form-title" className="text-xl font-bold">
            Nous écrire
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted">Une question, un événement ? Pour commander, passez plutôt par la commande en ligne ou le téléphone.</p>
          <div className="relative">
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
}
