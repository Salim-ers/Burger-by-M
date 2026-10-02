import type { Metadata } from "next";
import { restaurant } from "@/data/restaurant";
import { OPENING_HOURS_VALIDATED, restaurantHours } from "@/data/opening-hours";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** JSON-LD Restaurant — uniquement des informations vérifiées (aucune note, aucun avis, aucune fourchette de prix). */
export function restaurantJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: siteUrl,
    image: `${siteUrl}/images/social/og-image.jpg`,
    logo: `${siteUrl}${restaurant.logo.png}`,
    telephone: restaurant.phone.e164,
    servesCuisine: ["Burger", "Fast Food"],
    hasMenu: `${siteUrl}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.street,
      postalCode: restaurant.address.postalCode,
      addressLocality: restaurant.address.city,
      addressRegion: restaurant.address.region,
      addressCountry: restaurant.address.country,
    },
  };
  if (restaurant.geo) {
    data.geo = { "@type": "GeoCoordinates", latitude: restaurant.geo.lat, longitude: restaurant.geo.lng };
  }
  const sameAs = [restaurant.socials.instagram.url, restaurant.socials.facebook.url].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  // N'est publié qu'une fois les horaires validés par le restaurant (data/opening-hours.ts).
  if (OPENING_HOURS_VALIDATED) {
    data.openingHoursSpecification = Object.entries(restaurantHours).flatMap(([d, ranges]) =>
      ranges.map((r) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAYS[Number(d)],
        opens: r.open,
        closes: r.close,
      })),
    );
  }
  return data;
}
