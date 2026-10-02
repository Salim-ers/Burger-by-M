import type { Metadata } from "next";
import { MenuView } from "@/components/menu/MenuView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Notre carte — Smash burgers, Classics, Frenchy’s",
  description:
    "La carte de Burger By M à Rantigny : smash burgers, burgers classics au steak façon bouchère, Frenchy’s en baguette briochée, frites, desserts et milkshakes. Commande en ligne, retrait sur place.",
  path: "/menu",
});

export default function MenuPage() {
  return (
    <>
      <header className="shell pt-8 pb-8 md:pt-14 md:pb-12">
        <h1 className="font-display text-[3.4rem] leading-[0.95] md:text-[5.5rem]">Notre carte</h1>
        <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted md:text-lg">
          Choisissez vos burgers, Frenchy’s, frites et desserts. Ajoutez vos produits à votre commande et retirez-les sur place.
        </p>
      </header>
      <MenuView />
    </>
  );
}
