"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { mapsEmbedUrl, mapsUrl, fullAddress } from "@/data/restaurant";

/** Carte Google chargée uniquement après consentement (aucun cookie tiers avant clic). Format compact. */
export function MapEmbed() {
  const [consent, setConsent] = useState(false);
  if (consent) {
    return <iframe title={`Carte : ${fullAddress}`} src={mapsEmbedUrl} className="aspect-[16/10] w-full border-0 grayscale" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
  }
  return (
    <div className="flex aspect-[16/10] flex-col justify-between border-2 border-fg/15 p-5 md:p-6">
      <MapPin className="size-7 text-cheddar-deep" aria-hidden />
      <div>
        <p className="max-w-sm text-sm leading-relaxed text-fg/65">La carte interactive est fournie par Google Maps, qui peut déposer des cookies. Elle ne se charge qu’avec ton accord.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="dark" onClick={() => setConsent(true)}>
            Afficher la carte
          </Button>
          <ButtonLink href={mapsUrl} variant="outline">
            Ouvrir dans Maps
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
