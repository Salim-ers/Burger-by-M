import Image from "next/image";
import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { ButtonLink } from "@/components/ui/Button";
import { images } from "@/data/images";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "La carte — Smash burgers, Classics, Frenchy’s",
  description:
    "La carte de Burger By M à Rantigny : smash burgers, burgers classiques au steak façon bouchère, Frenchy’s en baguette briochée, frites, milkshakes et desserts. À emporter.",
  path: "/menu",
});

export default function MenuPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-ink pt-36 pb-16 md:pt-48 md:pb-24">
        <div aria-hidden className="absolute top-0 right-0 -z-10 h-full w-full md:w-[46%]">
          <Image src={images.plateau.src} alt="" fill priority sizes="(min-width: 768px) 46vw, 100vw" className="object-cover object-[50%_35%] opacity-45 md:opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent max-md:bg-ink/50" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
        </div>
        <div className="container-site">
          <h1 className="font-display text-mega font-medium uppercase">
            La
            <br />
            carte.
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
            <p className="max-w-md text-lg text-cream/75">Smash, Classics, Frenchy’s, sides et shakes. Tout se commande en ligne, à emporter.</p>
            <ButtonLink href="/commander" variant="rose" arrow className="self-start md:self-auto">
              Commander
            </ButtonLink>
          </div>
        </div>
      </header>
      <MenuBrowser />
    </>
  );
}
