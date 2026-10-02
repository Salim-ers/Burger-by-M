import Image from "next/image";
import type { Metadata } from "next";
import { RevealText } from "@/components/animations/RevealText";
import { RevealImage } from "@/components/animations/RevealImage";
import { RotatingStamp } from "@/components/brand/RotatingStamp";
import { LocalBlock } from "@/components/layout/LocalBlock";
import { MapEmbed } from "@/components/restaurant/MapEmbed";
import { HoursTable } from "@/components/restaurant/HoursTable";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { images } from "@/data/images";
import { restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Le restaurant — 19 avenue de la Gare, Rantigny",
  description: "Burger By M, restaurant de burgers au 19 avenue de la Gare à Rantigny (Oise). Horaires, accès, téléphone et commande à emporter.",
  path: "/restaurant",
});

export default function RestaurantPage() {
  return (
    <>
      <header className="relative bg-ink pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="container-site grid items-end gap-12 md:grid-cols-12">
          <div className="min-w-0 md:col-span-7">
            <p className="text-xs font-bold tracking-[0.16em] text-rose uppercase">Rantigny · Oise</p>
            <h1 className="mt-6 font-display text-[clamp(2.5rem,7.4vw,7rem)] leading-[0.86] font-medium tracking-[-0.035em] uppercase">
              Le
              <br />
              restaurant.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-cream/75">
              Une enseigne ronde sur l’avenue de la Gare, quelques tables en terrasse aux beaux jours, et l’odeur du steak qui grille.
            </p>
            <OpeningStatus className="mt-6 text-cream/85" />
          </div>
          <div className="relative md:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-xs">
              <Image src={images.storefront.src} alt={images.storefront.alt} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-[50%_72%]" />
            </div>
            <RotatingStamp className="absolute -bottom-8 -left-6 w-32 md:-left-14 md:w-40" />
          </div>
        </div>
      </header>

      <section aria-labelledby="horaires-title" className="bg-ivory py-24 text-ink md:py-36">
        <div className="container-site grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <RevealText id="horaires-title" lines={["On vous", "attend."]} className="font-display text-giant font-medium uppercase" />
            <p className="mt-6 max-w-sm text-ink/70">
              Commande en ligne à emporter, ou par téléphone au{" "}
              <a href={restaurant.phone.href} className="font-semibold underline-offset-4 hover:underline">
                {restaurant.phone.display}
              </a>
              .
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <HoursTable />
          </div>
        </div>
      </section>

      <section aria-labelledby="carte-imprimee" className="bg-ink py-24 md:py-36">
        <div className="container-site">
          <RevealText id="carte-imprimee" lines={["Ce qui sort", "de la cuisine."]} className="font-display text-huge font-medium uppercase" />
          <div className="mt-14 grid gap-4 md:grid-cols-12">
            <RevealImage image={images.plateau} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] rounded-xs md:col-span-5" position="50% 40%" />
            <div className="grid gap-4 md:col-span-7">
              <RevealImage image={images.forestier} sizes="(min-width: 768px) 56vw, 100vw" className="aspect-[720/385] rounded-xs" from="right" />
              <div className="grid grid-cols-2 gap-4">
                <RevealImage image={images.frenchyHot} sizes="(min-width: 768px) 28vw, 50vw" className="aspect-square rounded-xs" />
                <RevealImage image={images.shakeCaramel} sizes="(min-width: 768px) 28vw, 50vw" className="aspect-square rounded-xs" position="50% 30%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="acces-title" className="bg-cream py-24 text-ink md:py-36">
        <div className="container-site">
          <h2 id="acces-title" className="sr-only">
            Accès
          </h2>
          <LocalBlock tone="light" className="mb-12" />
          <MapEmbed />
        </div>
      </section>
    </>
  );
}
