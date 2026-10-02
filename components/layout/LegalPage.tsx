/** Gabarit des pages légales : lisibilité avant tout (fond clair, mesure ~70 caractères). */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <header className="scheme-dark bg-ink pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="shell">
          <h1 className="font-display text-d2">{title}</h1>
        </div>
      </header>
      <div className="scheme-light bg-bone py-16 text-ink md:py-24">
        <div className="shell">
          <p className="inline-block border-l-4 border-cheddar bg-cheddar/15 px-3 py-2 text-sm">
            Document en cours de finalisation : certaines informations restent à compléter par l’exploitant.
          </p>
          <div className="mt-12 max-w-[70ch] space-y-10 text-[1.02rem] leading-relaxed text-ink/80 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-ink [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
