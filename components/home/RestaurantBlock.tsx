import Image from "next/image";
import { MapPin, Navigation, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { images } from "@/data/images";
import { directionsUrl, restaurant } from "@/data/restaurant";

const front = images.storefront;

/** Le restaurant : vraie façade, adresse, téléphone, itinéraire / appel. */
export function RestaurantBlock() {
  return (
    <section aria-labelledby="resto-title" className="shell py-10 md:py-14">
      <div className="grid overflow-hidden rounded-xl border border-line bg-white md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
          <Image src={front.src} alt={front.alt} fill sizes="(min-width: 768px) 50vw, 100vw" quality={80} className="object-cover" style={{ objectPosition: "50% 45%" }} />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-10">
          <h2 id="resto-title" className="font-display text-[2.6rem] leading-none md:text-[3.4rem]">
            Burger By M
          </h2>
          <OpeningStatus className="mt-4" />
          <ul className="mt-6 space-y-3 text-[1.02rem]">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
              <span>
                {restaurant.address.street}
                <br />
                {restaurant.address.postalCode} {restaurant.address.city}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 shrink-0" aria-hidden />
              <a href={restaurant.phone.href} className="font-semibold tabular-nums hover:underline">
                {restaurant.phone.display}
              </a>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href={directionsUrl} variant="dark" size="lg">
              <Navigation className="size-4" aria-hidden /> Itinéraire
            </ButtonLink>
            <ButtonLink href={restaurant.phone.href} variant="outline" size="lg">
              <Phone className="size-4" aria-hidden /> Appeler
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
