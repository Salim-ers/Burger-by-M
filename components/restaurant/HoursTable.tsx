"use client";

import { useAdminStore } from "@/stores/admin-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { DAY_NAMES, DAY_ORDER } from "@/data/opening-hours";
import { formatRangesShort, parisNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** Horaires de la semaine (jour courant en gras). */
export function HoursTable({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const hours = useAdminStore((s) => s.hours.restaurant);
  const today = hydrated ? parisNow().day : -1;
  return (
    <table className={cn("w-full text-[0.95rem]", className)}>
      <caption className="sr-only">Horaires d’ouverture</caption>
      <tbody className="divide-y divide-line">
        {DAY_ORDER.map((d) => (
          <tr key={d} className={cn(d === today && "font-bold")}>
            <th scope="row" className="py-2.5 text-left font-[inherit]">
              {DAY_NAMES[d]}
              {d === today && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[0.7rem] text-white">Aujourd’hui</span>}
            </th>
            <td className={cn("py-2.5 text-right tabular-nums", hours[d].length === 0 && "text-muted")}>{formatRangesShort(hours[d])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
