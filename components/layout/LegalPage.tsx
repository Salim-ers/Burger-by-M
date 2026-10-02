/** Gabarit des pages légales : lisibilité avant tout (fond clair, mesure ~70 caractères). */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-ivory pt-32 pb-24 text-ink md:pt-44">
      <div className="container-site">
        <h1 className="font-display text-huge font-medium uppercase">{title}</h1>
        <div className="mt-6 inline-block rounded-xs bg-cheddar/20 px-3 py-2 text-sm text-brown-dark">
          Document en cours de finalisation : certaines informations restent à compléter par l’exploitant.
        </div>
        <div className="mt-12 max-w-[70ch] space-y-10 text-[1.02rem] leading-relaxed text-ink/80 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-ink [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}
