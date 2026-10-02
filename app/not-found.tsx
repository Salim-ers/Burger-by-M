import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { BurgerLineArt } from "@/components/ui/LineArt";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grain flex min-h-dvh flex-col bg-ink text-cream">
      <div className="container-site flex h-24 items-center">
        <Link href="/" aria-label="Burger By M — accueil">
          <Logo size={52} />
        </Link>
      </div>
      <div className="container-site flex flex-1 flex-col justify-center pb-24">
        <p className="font-display text-[clamp(7rem,26vw,22rem)] leading-[0.8] tracking-[-0.05em] text-rose" aria-hidden>
          404
        </p>
        <h1 className="mt-6 font-display text-huge font-medium uppercase">
          Ce burger
          <br />
          n’existe pas.
        </h1>
        <p className="mt-6 max-w-md text-cream/70">La page que tu cherches a été mangée, déplacée, ou n’a jamais existé.</p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <ButtonLink href="/menu" variant="rose" size="lg" arrow>
            Retour à la carte
          </ButtonLink>
          <BurgerLineArt className="w-24 text-cream/30" />
        </div>
      </div>
    </main>
  );
}
