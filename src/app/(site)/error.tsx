"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Erreur dans une page du site (l'en-tête et le pied de page restent affichés). */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section data-theme="dark" className="on-dark flex min-h-[80svh] items-end bg-ink pt-36 pb-20 md:pb-28">
      <div className="container-bm">
        <p className="t-label text-cheddar">Incident</p>
        <h1 className="mt-6">
          <span className="t-xl block">La plaque</span>
          <span className="s-xl block">a un souci.</span>
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-cream/70">Cette page n’a pas pu s’afficher. Réessayez ; si le problème continue, appelez-nous.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <Button variant="cheddar" size="lg" onClick={reset}>
            Réessayer
          </Button>
          <ButtonLink href="/menu" variant="line" size="lg">
            Voir la carte
          </ButtonLink>
        </div>
        {error.digest && <p className="mt-10 text-xs text-cream/50">Référence : {error.digest}</p>}
      </div>
    </section>
  );
}
