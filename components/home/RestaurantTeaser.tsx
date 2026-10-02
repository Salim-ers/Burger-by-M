import Image from "next/image";
import { RevealText } from "@/components/animations/RevealText";
import { Parallax } from "@/components/animations/Parallax";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { RotatingStamp } from "@/components/brand/RotatingStamp";
import { images } from "@/data/images";
import { mapsUrl, restaurant } from "@/data/restaurant";

export function RestaurantTeaser() {
  return (
    <section aria-labelledby="ici-title" className="relative overflow-hidden bg-ivory py-28 text-ink md:py-40">
      <div className="container-site grid items-center gap-14 md:grid-cols-12 md:gap-8">
        <div className="relative md:col-span-5">
          <Parallax offset={40}>
            {/* Arche : écho au cercle du logo */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-xs">
              <Image src={images.storefront.src} alt={images.storefront.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-[50%_72%]" />
            </div>
          </Parallax>
          <RotatingStamp className="absolute -right-4 -bottom-10 w-32 text-ink md:-right-12 md:w-40" />
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <RevealText id="ici-title" lines={["Ici,", "c’est By\u00a0M."]} className="font-display text-giant font-medium uppercase" />
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/75">
            Burger By M vous accueille à Rantigny pour vos burgers, sides et desserts à emporter. Avec une petite terrasse quand le soleil s’en mêle.
          </p>

          <div className="mt-10 grid gap-6 border-t border-ink/15 pt-8 sm:grid-cols-2">
            <address className="not-italic">
              <p className="text-xs font-bold tracking-[0.14em] text-brown uppercase">Adresse</p>
              <p className="mt-2 text-[1.05rem]">
                {restaurant.address.street}
                <br />
                {restaurant.address.postalCode} {restaurant.address.city}
              </p>
            </address>
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-brown uppercase">Téléphone</p>
              <a href={restaurant.phone.href} className="mt-2 block text-[1.05rem] hover:underline">
                {restaurant.phone.display}
              </a>
              <OpeningStatus className="mt-3 text-ink/80" />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={mapsUrl} variant="ink" arrow>
              Nous trouver
            </ButtonLink>
            <ButtonLink href={restaurant.phone.href} variant="outline-dark">
              Appeler
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
