"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Erreur inattendue (hors mise en page du site : aucune dépendance aux données). */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="on-light flex min-h-dvh flex-col justify-center bg-ivory">
      <div className="shell py-24">
        <p className="kicker text-brass-deep">Incident</p>
        <h1 className="display-2 mt-6">
          La plaque a <span className="italic">un souci.</span>
        </h1>
        <p className="mt-6 max-w-md text-sub">Une erreur est survenue de notre côté. Réessayez dans un instant ; si le problème continue, appelez-nous au 03 44 24 89 18.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="inline-flex h-14 items-center bg-ink px-8 text-[0.75rem] font-bold tracking-[0.2em] text-ivory uppercase hover:bg-ink-soft">
            Réessayer
          </button>
          <Link href="/" className="inline-flex h-14 items-center border border-ink/30 px-8 text-[0.75rem] font-bold tracking-[0.2em] uppercase hover:border-ink">
            Accueil
          </Link>
        </div>
        {error.digest && <p className="mt-10 text-xs text-sub">Référence : {error.digest}</p>}
      </div>
    </main>
  );
}
