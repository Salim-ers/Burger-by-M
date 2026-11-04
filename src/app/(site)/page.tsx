import type { Metadata } from "next";
import { headers } from "next/headers";
import { Intro } from "@/components/site/Intro";
import { Hero } from "@/components/home/Hero";
import { Plancha } from "@/components/home/Plancha";
import { Genereux } from "@/components/home/Genereux";
import { Commander } from "@/components/home/Commander";
import { getPublicStore } from "@/features/public-data";
import { jsonLd, restaurantJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Accueil : donner envie d'explorer, pas tout montrer. Un hero, deux moments photographiques, une action.
 * La carte, le restaurant et la galerie ont leurs propres pages.
 */
export default async function HomePage() {
  const [store, h] = await Promise.all([getPublicStore(), headers()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(restaurantJsonLd(store))} />
      <Intro nonce={h.get("x-nonce") ?? undefined} />
      <Hero />
      <Plancha />
      <Genereux />
      <Commander />
    </>
  );
}
