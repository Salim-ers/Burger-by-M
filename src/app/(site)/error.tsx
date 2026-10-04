"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/Button";

/** Erreur dans une page du site (l'en-tête et le pied de page restent affichés). */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="on-light bg-ivory pt-36 pb-28 md:pt-48">
      <div className="shell">
        <p className="kicker text-brass-deep">Incident</p>
        <h1 className="display-2 mt-6">
          La plaque a <span className="italic">un souci.</span>
        </h1>
        <p className="mt-6 max-w-md text-sub">Cette page n’a pas pu s’afficher. Réessayez ; si le problème continue, appelez-nous.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="inline-flex h-14 items-center bg-ink px-8 text-[0.75rem] font-bold tracking-[0.2em] text-ivory uppercase hover:bg-ink-soft">
            Réessayer
          </button>
          <ButtonLink href="/menu" variant="line" size="lg">
            Voir la carte
          </ButtonLink>
        </div>
        {error.digest && <p className="mt-10 text-xs text-sub">Référence : {error.digest}</p>}
      </div>
    </section>
  );
}
