import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

/** Prix façon carte : « 11,90 » + symbole € réduit. */
export function Price({ cents, className, euro = true }: { cents: number | null; className?: string; euro?: boolean }) {
  if (cents === null) {
    return <span className={cn("font-sans text-[0.72rem] font-semibold tracking-[0.12em] uppercase opacity-60", className)}>Prix à confirmer</span>;
  }
  const [amount] = formatPrice(cents).split(" €");
  return (
    <span className={cn("tabular-nums whitespace-nowrap", className)}>
      {amount}
      {euro && <span className="ml-[0.12em] text-[0.62em]">€</span>}
    </span>
  );
}
