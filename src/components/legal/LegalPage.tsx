import { legal } from "@/data/legal";

/** Mise en page des pages légales : titre éditorial, texte courant lisible. */
export function LegalPage({ kicker = "Informations légales", title, children }: { kicker?: string; title: string; children: React.ReactNode }) {
  return (
    <article className="on-light bg-ivory pt-28 pb-28 md:pt-40">
      <div className="shell grid gap-12 md:grid-cols-12">
        <header className="md:col-span-4">
          <p className="kicker text-brass-deep">{kicker}</p>
          <h1 className="display-3 mt-5">{title}</h1>
          <p className="mt-6 text-xs text-sub">Dernière mise à jour : {legal.lastUpdate}</p>
        </header>
        <div className="legal-prose max-w-2xl md:col-span-7 md:col-start-6">{children}</div>
      </div>
    </article>
  );
}
