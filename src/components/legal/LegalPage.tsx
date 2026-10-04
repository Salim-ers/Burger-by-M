import { legal } from "@/data/legal";

/** Pages légales : titre brut, texte courant lisible, fond ivoire. */
export function LegalPage({ kicker = "Informations légales", title, children }: { kicker?: string; title: string; children: React.ReactNode }) {
  return (
    <article data-theme="light" className="on-light bg-ivory pt-28 pb-[var(--space-xl)] md:pt-40">
      <div className="container-bm grid gap-12 md:grid-cols-12">
        <header className="md:col-span-4">
          <p className="t-label text-cheddar-deep">{kicker}</p>
          <h1 className="t-l mt-5 break-words">{title}</h1>
          <p className="mt-6 text-xs text-sub">Dernière mise à jour : {legal.lastUpdate}</p>
        </header>
        <div className="legal-prose max-w-2xl md:col-span-7 md:col-start-6">{children}</div>
      </div>
    </article>
  );
}
