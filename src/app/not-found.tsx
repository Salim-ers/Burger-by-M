import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

/**
 * 404 globale (hors mise en page du site : aucune requête à la base).
 * Rendue à la requête pour recevoir le nonce de la CSP (une page statique aurait ses scripts bloqués).
 */
export default async function NotFound() {
  await connection();
  return (
    <main className="on-light relative flex min-h-dvh flex-col overflow-hidden bg-ivory">
      <div className="shell flex h-16 items-center md:h-20">
        <Link href="/" aria-label="Burger By M — accueil" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="hidden font-serif text-[1.05rem] tracking-[0.16em] sm:inline">
            BURGER <span className="italic">by</span> M
          </span>
        </Link>
      </div>
      <div className="shell flex flex-1 flex-col justify-center pb-24">
        <p className="kicker text-brass-deep">Erreur 404</p>
        <h1 className="display-1 mt-6 max-w-[14ch]">
          Ce burger n’est pas <span className="italic">à la carte.</span>
        </h1>
        <p className="mt-8 max-w-md text-[1.05rem] text-sub">La page demandée n’existe pas ou a changé d’adresse. La carte, elle, est toujours là.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <ButtonLink href="/menu" variant="ink" size="lg" arrow>
            Voir la carte
          </ButtonLink>
          <ButtonLink href="/" variant="line" size="lg">
            Accueil
          </ButtonLink>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none absolute right-[-2vw] bottom-[-6vw] font-serif text-[38vw] leading-none text-ink/[0.04] select-none">
        404
      </p>
    </main>
  );
}
