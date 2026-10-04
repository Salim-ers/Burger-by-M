import type { Metadata } from "next";
import { RestaurantView } from "@/components/store/RestaurantView";
import { getPublicStore } from "@/features/public-data";
import { jsonLd, pageMetadata, restaurantJsonLd } from "@/lib/seo";
import { media } from "@/data/media";

export const metadata: Metadata = pageMetadata({
  title: "Le restaurant — 19 avenue de la Gare, Rantigny",
  description: "Burger By M, 19 avenue de la Gare à Rantigny (60290) : horaires, téléphone, itinéraire. Sur place ou à emporter, commande en ligne et retrait au comptoir.",
  path: "/restaurant",
  image: { url: media.devanture.src, width: media.devanture.width, height: media.devanture.height, alt: media.devanture.alt },
});

export default async function RestaurantPage() {
  const store = await getPublicStore();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(restaurantJsonLd(store))} />
      <RestaurantView />
    </>
  );
}
