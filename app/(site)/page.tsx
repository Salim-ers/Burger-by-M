import { HomeHero } from "@/components/home/HomeHero";
import { QuickCategories } from "@/components/home/QuickCategories";
import { Featured } from "@/components/home/Featured";
import { RestaurantBlock } from "@/components/home/RestaurantBlock";
import { restaurantJsonLd } from "@/lib/seo";

/** Accueil court : la carte est à un clic, partout. */
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()).replace(/</g, "\\u003c") }} />
      <HomeHero />
      <QuickCategories />
      <Featured />
      <RestaurantBlock />
    </>
  );
}
