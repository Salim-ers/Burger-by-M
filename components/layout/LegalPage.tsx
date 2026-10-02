/** Gabarit des pages légales : lisibilité avant tout (mesure ~70 caractères). */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="shell pt-8 pb-20 md:pt-12">
      <h1 className="font-display text-[2.8rem] leading-none md:text-[3.8rem]">{title}</h1>
      <p className="mt-5 inline-block rounded-lg bg-white px-4 py-2.5 text-sm text-muted ring-1 ring-line">
        Document en cours de finalisation : certaines informations restent à compléter par l’exploitant.
      </p>
      <div className="mt-10 max-w-[70ch] space-y-8 text-[1.02rem] leading-relaxed text-ink/80 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
