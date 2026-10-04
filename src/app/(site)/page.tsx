import type { Metadata } from "next";
import { headers } from "next/headers";
import { Intro } from "@/components/site/Intro";
import { Hero } from "@/components/home/Hero";
import { BurgerBuild } from "@/components/home/BurgerBuild";
import { Manifesto } from "@/components/home/Manifesto";
import { Signatures } from "@/components/home/Signatures";
import { WordsMarquee } from "@/components/home/WordsMarquee";
import { Frenchys } from "@/components/home/Frenchys";
import { Shakes } from "@/components/home/Shakes";
import { Generous } from "@/components/home/Generous";
import { OrderSteps } from "@/components/home/OrderSteps";
import { KitchenTicker } from "@/components/home/KitchenTicker";
import { RestaurantHome } from "@/components/home/RestaurantHome";
import { GalleryHome } from "@/components/home/GalleryHome";
import { getPublicStore } from "@/features/public-data";
import { jsonLd, restaurantJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Accueil : WOW → J'AI FAIM → JE VEUX CELUI-LÀ → JE COMMANDE.
 * Rythme des fonds : noir → crème → ivoire → noir → charbon → crème → photo → ivoire → noir → crème.
 */
export default async function HomePage() {
  const [store, h] = await Promise.all([getPublicStore(), headers()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(restaurantJsonLd(store))} />
      <Intro nonce={h.get("x-nonce") ?? undefined} />
      <Hero />
      <BurgerBuild />
      <Manifesto />
      <Signatures />
      <WordsMarquee />
      <Frenchys />
      <Shakes />
      <Generous />
      <OrderSteps />
      <KitchenTicker />
      <RestaurantHome />
      <GalleryHome />
    </>
  );
}
