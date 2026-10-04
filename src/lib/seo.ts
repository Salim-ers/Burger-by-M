import type { Metadata } from "next";
import { brand } from "@/data/brand";
import type { MenuCategory } from "@/features/menu/types";
import type { PublicStore } from "@/features/public-data";

export const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const defaultOgImage = { url: "/images/social/og-burger-by-m.jpg", width: 1200, height: 630, alt: "Smash Double Burger By M : double steak smash et cheddar fondu" };

/**
 * Métadonnées d'une page. Next remplace l'objet openGraph du parent en entier :
 * on répète donc nom du site, langue et image par défaut.
 */
export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: { url: string; width: number; height: number; alt: string } }): Metadata {
  const img = image ?? defaultOgImage;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "fr_FR", siteName: brand.name, title, description, url: path, images: [img] },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** JSON-LD Restaurant / LocalBusiness — NAP cohérent, horaires issus de la base, aucune note inventée. */
export function restaurantJsonLd(store: PublicStore) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": `${siteUrl}/#restaurant`,
    name: store.name,
    url: siteUrl,
    image: [`${siteUrl}/images/editorial/hero-smash-double.webp`, `${siteUrl}/images/restaurant/devanture.webp`],
    logo: `${siteUrl}${brand.logo.png}`,
    telephone: brand.phone.e164,
    servesCuisine: ["Burger", "Smash burger", "Street food"],
    hasMenu: `${siteUrl}/menu`,
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.street,
      postalCode: store.postalCode,
      addressLocality: store.city,
      addressRegion: brand.address.region,
      addressCountry: brand.address.country,
    },
    openingHoursSpecification: store.schedule.weekly.map((r) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAYS[r.dayOfWeek], opens: r.opensAt, closes: r.closesAt })),
  };
  const sameAs = [store.instagramUrl, store.facebookUrl].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

/** JSON-LD Menu : sections et plats avec leur prix (uniquement les prix confirmés). */
export function menuJsonLd(menu: MenuCategory[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "La carte Burger By M",
    url: `${siteUrl}/menu`,
    inLanguage: "fr",
    hasMenuSection: menu.map((c) => ({
      "@type": "MenuSection",
      name: c.title,
      hasMenuItem: c.products.map((p) => ({
        "@type": "MenuItem",
        name: p.name,
        url: `${siteUrl}/menu/${p.slug}`,
        description: p.ingredients.map((i) => i.name).join(", ") || p.description || undefined,
        ...(p.image ? { image: `${siteUrl}${p.image.src}` } : {}),
        ...(p.priceCents !== null ? { offers: { "@type": "Offer", price: (p.priceCents / 100).toFixed(2), priceCurrency: "EUR", availability: p.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } } : {}),
        ...(p.isVegetarian ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
      })),
    })),
  };
}

/** Sérialisation sûre pour <script type="application/ld+json">. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
