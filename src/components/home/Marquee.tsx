/** Texte horizontal en mouvement très lent (CSS pur, arrêté si mouvement réduit). */
export function Marquee({ items = ["Smashed to order", "Rantigny", "Burger by M"] }: { items?: string[] }) {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden>
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 font-serif text-[clamp(2.4rem,7vw,6.5rem)] leading-none italic md:px-12">{t}</span>
          <span className="size-2 rotate-45 bg-brass" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="on-light overflow-hidden border-y border-rule bg-ivory py-8 md:py-10">
      <p className="sr-only">{items.join(" — ")}</p>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  );
}
