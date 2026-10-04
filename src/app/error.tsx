"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Erreur inattendue (hors mise en page du site : aucune dépendance aux données). */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="on-dark flex min-h-dvh flex-col justify-end bg-ink">
      <div className="container-bm py-24">
        <p className="t-label text-cheddar">Incident</p>
        <h1 className="mt-6">
          <span className="t-xl block">La plaque</span>
          <span className="s-xl block">a un souci.</span>
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-cream/70">Une erreur est survenue de notre côté. Réessayez dans un instant ; si le problème continue, appelez-nous au 03 44 24 89 18.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="t-label inline-flex h-14 items-center bg-cheddar px-8 text-ink transition-colors hover:bg-cream">
            Réessayer
          </button>
          <Link href="/" className="t-label inline-flex h-14 items-center border border-cream/30 px-8 transition-colors hover:border-cream">
            Accueil
          </Link>
        </div>
        {error.digest && <p className="mt-10 text-xs text-cream/50">Référence : {error.digest}</p>}
      </div>
    </main>
  );
}
