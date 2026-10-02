import Link from "next/link";
import { RevealText } from "@/components/animations/RevealText";
import { BestSellerRow } from "./BestSellerRow";

/** Sélection éditoriale (produits avec photo réelle correspondante). */
const PICKS = [
  { productId: "le-special", label: "Smash · best seller de la carte", line: "Le cheddar déborde. C’est voulu.", position: "50% 58%" },
  { productId: "spicy-chicken", label: "Classic · épicé", line: "Croustillant dehors. Piquant dedans.", position: "50% 45%" },
  { productId: "le-hot", label: "Frenchy’s · épicé", line: "La baguette briochée qui ne fait pas semblant.", position: "50% 50%" },
];

export function BestSellers() {
  return (
    <section aria-labelledby="bestsellers-title" className="bg-ink-warm pt-36 pb-28 md:pt-48 md:pb-40">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <RevealText
            id="bestsellers-title"
            lines={["Les", "incontournables."]}
            className="font-display text-[clamp(2.1rem,6.6vw,6.4rem)] leading-[0.86] font-medium tracking-[-0.04em] uppercase"
          />
          <Link href="/menu" className="group inline-flex items-center gap-3 text-sm font-semibold text-cream/75 hover:text-cream">
            <span className="border-b border-cream/30 pb-1 group-hover:border-rose">Toute la carte</span>
          </Link>
        </div>
        <div className="mt-20 space-y-28 md:mt-28 md:space-y-40">
          {PICKS.map((p, i) => (
            <BestSellerRow key={p.productId} {...p} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
