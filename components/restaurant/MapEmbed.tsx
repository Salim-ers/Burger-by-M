"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { mapsEmbedUrl, mapsUrl, fullAddress } from "@/data/restaurant";

/** Carte Google chargée uniquement après consentement (aucun cookie tiers avant clic). Format compact. */
export function MapEmbed() {
  const [consent, setConsent] = useState(false);
  if (consent) {
    return <iframe title={`Carte : ${fullAddress}`} src={mapsEmbedUrl} className="aspect-[16/10] w-full rounded-xl border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
  }
  return (
    <div className="flex min-h-56 flex-col justify-between gap-6 rounded-xl border border-line bg-white p-5 md:p-6">
      <MapPin className="size-7" aria-hidden />
      <div>
        <p className="max-w-sm text-sm leading-relaxed text-muted">La carte interactive est fournie par Google Maps, qui peut déposer des cookies. Elle ne se charge qu’avec votre accord.</p>
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
