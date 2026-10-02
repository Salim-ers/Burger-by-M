"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { mapsEmbedUrl, mapsUrl, fullAddress } from "@/data/restaurant";

/** Carte Google chargée uniquement après consentement (aucun cookie tiers avant clic). */
export function MapEmbed() {
  const [consent, setConsent] = useState(false);
  if (consent) {
    return (
      <iframe
        title={`Carte : ${fullAddress}`}
        src={mapsEmbedUrl}
        className="aspect-[4/3] w-full rounded-xs border-0 grayscale-[0.4] md:aspect-[16/10]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-5 rounded-xs border border-ink/15 bg-cream p-6 text-center text-ink md:aspect-[16/10]">
      <MapPin className="size-8 text-brown" aria-hidden />
      <p className="max-w-sm text-sm leading-relaxed text-ink/70">
        La carte interactive est fournie par Google Maps, qui peut déposer des cookies. Elle ne se charge qu’avec ton accord.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ink" onClick={() => setConsent(true)}>
          Afficher la carte
        </Button>
        <ButtonLink href={mapsUrl} variant="outline-dark">
          Ouvrir dans Google Maps
        </ButtonLink>
      </div>
    </div>
  );
}
