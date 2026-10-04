import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Prix éditorial : chiffres tabulaires, € en exposant (sans-serif, lisible à toutes les tailles). null → « Prix au restaurant ». */
export function Price({ cents, className }: { cents: number | null; className?: string }) {
  if (cents === null) return <span className={cn("text-[0.85em] italic opacity-70", className)}>Prix au restaurant</span>;
  const [amount] = formatPrice(cents).split(" €");
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      {amount}
      <span className="ml-[0.14em] align-[0.42em] font-sans text-[0.46em] font-semibold">€</span>
    </span>
  );
}
