import { MapPin, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { directionsUrl, restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

/** Bloc local : identité + adresse + 3 actions (SEO local et conversion). */
export function LocalBlock({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-col gap-8 md:flex-row md:items-end md:justify-between", className)}>
      <address className="not-italic">
        <p className="font-display text-title uppercase">{restaurant.name}</p>
        <p className={cn("mt-4 flex items-start gap-2 text-base", dark ? "text-cream/75" : "text-ink/75")}>
          <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
          <span>
            {restaurant.address.street}
            <br />
            {restaurant.address.postalCode} {restaurant.address.city}
          </span>
        </p>
        <p className={cn("mt-2 flex items-center gap-2 text-base", dark ? "text-cream/75" : "text-ink/75")}>
          <Phone className="size-4 shrink-0" aria-hidden />
          <a href={restaurant.phone.href} className="underline-offset-4 hover:underline">
            {restaurant.phone.display}
          </a>
        </p>
      </address>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={restaurant.phone.href} variant={dark ? "outline-light" : "outline-dark"}>
          Appeler
        </ButtonLink>
        <ButtonLink href={directionsUrl} variant={dark ? "outline-light" : "outline-dark"}>
          Itinéraire
        </ButtonLink>
        <ButtonLink href="/commander" variant={dark ? "rose" : "ink"} arrow>
          Commander
        </ButtonLink>
      </div>
    </div>
  );
}
