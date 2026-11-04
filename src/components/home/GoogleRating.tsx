"use client";

import { useSite } from "@/features/site-context";
import { brand, mapsLinks } from "@/data/brand";
import { cn } from "@/lib/utils";

const Star = () => (
  <svg viewBox="0 0 20 20" aria-hidden className="size-4 fill-current">
    <path d="M10 1.6l2.47 5.3 5.8.72-4.28 3.97 1.13 5.73L10 14.46l-5.12 2.86 1.13-5.73L1.73 7.62l5.8-.72z" />
  </svg>
);

/** Note Google : renvoie vers les avis, pour que chacun puisse la vérifier. Aucun avis n'est rédigé ni reproduit ici. */
export function GoogleRating({ className }: { className?: string }) {
  const { store } = useSite();
  const href = store.googleReviewsUrl ?? mapsLinks(`${store.street}, ${store.postalCode} ${store.city}`).search;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Note Google : ${brand.googleRating.label} sur 5. Voir les avis`} className={cn("inline-flex min-h-8 items-center gap-2 text-[0.95rem] text-cream", className)}>
      <span className="flex gap-0.5 text-cheddar">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} />
        ))}
      </span>
      <span className="font-bold">{brand.googleRating.label}</span>
      <span className="opacity-85">sur Google</span>
    </a>
  );
}
