import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { BurgerBuild } from "@/components/home/BurgerBuild";
import { Signature } from "@/components/home/Signature";
import { BestSellers } from "@/components/home/BestSellers";
import { MenuIndex } from "@/components/home/MenuIndex";
import { Marquee } from "@/components/home/Marquee";
import { RestaurantSection } from "@/components/home/RestaurantSection";
import { Reviews } from "@/components/home/Reviews";
import { FinalCta } from "@/components/home/FinalCta";
import { getPublicStore } from "@/features/public-data";
import { jsonLd, restaurantJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const store = await getPublicStore();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(restaurantJsonLd(store))} />
      <Hero />
      <BurgerBuild />
      <Signature />
      <BestSellers />
      <MenuIndex />
      <Marquee />
      <RestaurantSection />
      <Reviews />
      <FinalCta />
    </>
  );
}
