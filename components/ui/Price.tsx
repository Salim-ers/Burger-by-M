import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

/** Prix « 11,90 € ». Prix inconnu (null) → « Voir au restaurant ». */
export function Price({ cents, className }: { cents: number | null; className?: string }) {
  if (cents === null) return <span className={cn("text-[0.85em] font-semibold text-muted", className)}>Voir au restaurant</span>;
  return <span className={cn("whitespace-nowrap tabular-nums", className)}>{formatPrice(cents)}</span>;
}
