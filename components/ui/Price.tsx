import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * Prix : chiffres dans la typo du contexte, symbole € en sans-serif
 * (le glyphe € des Didones est peu lisible en grand).
 */
export function Price({ cents, className }: { cents: number | null; className?: string }) {
  if (cents === null) {
    return <span className={cn("font-sans text-[0.55em] font-medium italic opacity-70", className)}>Prix à confirmer</span>;
  }
  const [amount] = formatPrice(cents).split("\u00a0€");
  return (
    <span className={cn("tabular-nums whitespace-nowrap", className)}>
      {amount}
      <span className="ml-[0.12em] font-sans text-[0.62em] font-medium">€</span>
    </span>
  );
}
