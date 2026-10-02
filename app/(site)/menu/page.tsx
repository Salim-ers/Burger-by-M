import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { ButtonLink } from "@/components/ui/Button";
import { LineReveal } from "@/components/motion/LineReveal";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "La carte — Smash burgers, Classics, Frenchy’s",
  description:
    "La carte de Burger By M à Rantigny : smash burgers, burgers classiques au steak façon bouchère, Frenchy’s en baguette briochée, frites, milkshakes et desserts. À emporter.",
  path: "/menu",
});

/** /menu : en-tête noir, carte imprimée sur blanc cassé. */
export default function MenuPage() {
  return (
    <>
      <header className="scheme-dark bg-ink pt-32 pb-10 md:pt-40 md:pb-14">
        <div className="shell">
          <div className="flex items-center justify-between border-b border-graphite pb-3">
            <span className="kicker text-bone/55">Burger By M — Rantigny</span>
            <span className="kicker text-bone/55 tabular-nums">
              {products.length} produits · {categories.length} rubriques
            </span>
          </div>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <LineReveal as="h1" lines={[<>Menu<span className="text-cheddar">.</span></>]} className="font-display text-[clamp(6rem,30vw,22rem)] leading-[0.8]" />
            <div className="max-w-sm lg:pb-6">
              <p className="text-[0.95rem] leading-relaxed text-bone/70">Smash, Classics, Frenchy’s, sides, shakes et desserts. Tout se commande en ligne, retrait au 19 avenue de la Gare.</p>
              <ButtonLink href="/commander" variant="primary" size="lg" arrow className="mt-6">
                Commander
              </ButtonLink>
            </div>
          </div>
        </div>
      </header>
      <MenuBrowser variant="editorial" />
    </>
  );
}
