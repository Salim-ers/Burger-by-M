import type { Metadata } from "next";
import { RestaurantBlock } from "@/components/home/RestaurantBlock";
import { RevealImage } from "@/components/motion/RevealImage";
import { LineReveal } from "@/components/motion/LineReveal";
import { MapEmbed } from "@/components/restaurant/MapEmbed";
import { ButtonLink } from "@/components/ui/Button";
import { images } from "@/data/images";
import { restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Le restaurant — 19 avenue de la Gare, Rantigny",
  description: "Burger By M, restaurant de burgers au 19 avenue de la Gare à Rantigny (Oise). Horaires, accès, téléphone et commande à emporter.",
  path: "/restaurant",
});

export default function RestaurantPage() {
  return (
    <>
      <RestaurantBlock index="Rantigny · Oise" headingLevel="h1" />

      <section aria-labelledby="lieu-title" className="scheme-light bg-bone py-20 text-ink md:py-32">
        <div className="shell grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-7">
            <RevealImage image={images.terrace} sizes="(min-width: 768px) 58vw, 100vw" className="aspect-[4/5] md:aspect-[5/4]" from="left" />
          </div>
          <div className="col-span-12 flex flex-col justify-between gap-10 md:col-span-5 md:pl-6">
            <div>
              <p className="kicker text-ink/55">Le lieu</p>
              <LineReveal id="lieu-title" lines={["Enseigne ronde.", "Plaque chaude.", "Terrasse."]} className="mt-5 font-display text-d3" />
              <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-ink/65">
                Sur l’avenue de la Gare. Commande en ligne, retrait au comptoir, ou par téléphone au{" "}
                <a href={restaurant.phone.href} className="font-semibold underline underline-offset-4">
                  {restaurant.phone.display}
                </a>
                .
              </p>
              <ButtonLink href="/commander" variant="primary" size="lg" arrow className="mt-8">
                Commander
              </ButtonLink>
            </div>
            <MapEmbed />
          </div>
        </div>
      </section>
    </>
  );
}
