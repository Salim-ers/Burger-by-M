import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Logo, Wordmark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

/**
 * 404 globale (hors mise en page du site : aucune requête à la base).
 * Rendue à la requête pour recevoir le nonce de la CSP (une page statique aurait ses scripts bloqués).
 */
export default async function NotFound() {
  await connection();
  return (
    <main className="on-dark relative flex min-h-dvh flex-col overflow-hidden bg-ink">
      <div className="container-bm flex h-16 items-center md:h-24">
        <Link href="/" aria-label="Burger By M — accueil" className="flex items-center gap-3">
          <Logo size={44} />
          <Wordmark className="hidden text-[1.05rem] sm:inline" />
        </Link>
      </div>
      <div className="container-bm relative z-10 flex flex-1 flex-col justify-center pb-24">
        <p className="t-label text-cheddar">Erreur 404</p>
        <h1 className="mt-6">
          <span className="t-xl block">Pas à</span>
          <span className="s-xl block">la carte.</span>
        </h1>
        <p className="mt-8 max-w-md text-[1.05rem] leading-relaxed text-cream/70">La page demandée n’existe pas ou a changé d’adresse. La carte, elle, est toujours là.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <ButtonLink href="/menu" variant="cheddar" size="lg" arrow>
            Voir la carte
          </ButtonLink>
          <ButtonLink href="/" variant="line" size="lg">
            Accueil
          </ButtonLink>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none absolute right-[-3vw] bottom-[-9vw] font-display text-[44vw] leading-none text-cream/[0.04] select-none">
        404
      </p>
    </main>
  );
}
