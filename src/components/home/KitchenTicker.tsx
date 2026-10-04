/**
 * Ticker décoratif « ticket cuisine » — pur storytelling : numéros fictifs, aucune donnée réelle,
 * masqué des lecteurs d'écran.
 */
const ITEMS = ["Order 1041 — Preparing", "Order 1042 — Ready", "Order 1043 — Smashing", "Order 1044 — Melting", "Order 1045 — Ready"];

export function KitchenTicker() {
  const row = (
    <div className="flex shrink-0 items-center">
      {[...ITEMS, ...ITEMS].map((t, i) => (
        <span key={i} className="t-label flex items-center gap-6 px-6 whitespace-nowrap">
          <span className={i % 3 === 1 ? "text-cheddar" : "text-cream/70"}>{t}</span>
          <span className="text-cream/25">✕</span>
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden className="on-dark relative overflow-hidden bg-ink py-4">
      <div className="perforated absolute inset-x-0 -top-[5px]" style={{ ["--bg" as string]: "var(--ivory)" }} />
      <div className="flex w-max animate-ticker motion-reduce:animate-none">
        {row}
        {row}
      </div>
      <div className="perforated absolute inset-x-0 -bottom-[5px] rotate-180" style={{ ["--bg" as string]: "var(--charcoal)" }} />
    </div>
  );
}
