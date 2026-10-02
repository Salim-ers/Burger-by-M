"use client";

import { useAdminStore } from "@/stores/admin-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { DAY_NAMES, DAY_ORDER } from "@/data/opening-hours";
import { formatRanges, parisNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

export function HoursTable({ tone = "light" }: { tone?: "light" | "dark" }) {
  const hydrated = useHydrated();
  const hours = useAdminStore((s) => s.hours.restaurant);
  const today = hydrated ? parisNow().day : -1;
  return (
    <table className="w-full text-[0.98rem]">
      <caption className="sr-only">Horaires d’ouverture</caption>
      <tbody>
        {DAY_ORDER.map((d) => (
          <tr key={d} className={cn("border-b", tone === "light" ? "border-ink/10" : "border-cream/10", d === today && "font-semibold")}>
            <th scope="row" className="py-3 text-left font-normal">
              {DAY_NAMES[d]}
              {d === today && <span className={cn("ml-2 text-xs", tone === "light" ? "text-brown" : "text-rose")}>aujourd’hui</span>}
            </th>
            <td className={cn("py-3 text-right tabular-nums", hours[d].length === 0 && "opacity-50")}>{formatRanges(hours[d])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
