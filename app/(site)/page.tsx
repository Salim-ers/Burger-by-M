import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Signature } from "@/components/home/Signature";
import { MenuPreview } from "@/components/home/MenuPreview";
import { Frenchys } from "@/components/home/Frenchys";
import { MarqueeBand } from "@/components/home/MarqueeBand";
import { DirtyFries } from "@/components/home/DirtyFries";
import { Shakes } from "@/components/home/Shakes";
import { RestaurantBlock } from "@/components/home/RestaurantBlock";
import { FinalCta } from "@/components/home/FinalCta";
import { restaurantJsonLd } from "@/lib/seo";

/**
 * Rythme : noir → blanc → sticky noir → carte blanche → graphite horizontal → bande
 * → cheddar → métal → photo → noir.
 */
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()).replace(/</g, "\\u003c") }} />
      <Hero />
      <Manifesto />
      <Signature />
      <MenuPreview />
      <Frenchys />
      <div className="bg-graphite">
        <MarqueeBand tone="light" tilt={-2} items={["Smashed daily", "Rantigny", "Burger By M", "Frenchy’s", "Dirty fries"]} />
      </div>
      <DirtyFries />
      <Shakes />
      <div className="bg-ink">
        <MarqueeBand tone="dark" tilt={1.5} direction={-1} items={["Burgers", "Shakes", "Fries", "Repeat"]} />
      </div>
      <RestaurantBlock />
      <FinalCta />
    </>
  );
}
