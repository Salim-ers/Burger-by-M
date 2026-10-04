"use client";

import { MapPin } from "lucide-react";
import { setConsent, useConsent } from "@/features/consent";
import { Button, ButtonLink } from "@/components/ui/Button";
import { mapsLinks } from "@/data/brand";
import { cn } from "@/lib/utils";

/** Carte Google Maps chargée uniquement après accord explicite (cookies Google). */
export function MapEmbed({ address, className }: { address: string; className?: string }) {
  const allowed = useConsent("maps");
  const links = mapsLinks(address);
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      {allowed ? (
        <iframe title={`Plan d’accès — ${address}`} src={links.embed} className="absolute inset-0 size-full border-0 grayscale-[35%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <MapPin className="size-8 text-cheddar-deep" strokeWidth={1.25} aria-hidden />
          <p className="t-m">{address}</p>
          <p className="max-w-sm text-sm text-sub">La carte est fournie par Google Maps, qui dépose des cookies. Elle ne s’affiche qu’avec votre accord.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="ink" size="md" onClick={() => setConsent("maps", true)}>
              Afficher la carte
            </Button>
            <ButtonLink href={links.directions} variant="line" size="md">
              Ouvrir dans Maps
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
