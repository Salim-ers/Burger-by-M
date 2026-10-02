import { Hero } from "@/components/home/Hero";
import { Signature } from "@/components/home/Signature";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { BestSellers } from "@/components/home/BestSellers";
import { FoodPorn } from "@/components/home/FoodPorn";
import { Categories } from "@/components/home/Categories";
import { RestaurantTeaser } from "@/components/home/RestaurantTeaser";
import { Milkshakes } from "@/components/home/Milkshakes";
import { Reviews } from "@/components/home/Reviews";
import { FinalCta } from "@/components/home/FinalCta";
import { restaurantJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()).replace(/</g, "\\u003c") }} />
      <Hero />
      <Signature />
      <BrandMarquee />
      <BestSellers />
      <FoodPorn />
      <Categories />
      <RestaurantTeaser />
      <Milkshakes />
      <Reviews />
      <FinalCta />
    </>
  );
}
