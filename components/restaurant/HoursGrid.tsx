"use client";

import { useAdminStore } from "@/stores/admin-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { DAY_NAMES, DAY_ORDER } from "@/data/opening-hours";
import { parisNow } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** Horaires en grille simple (7 cases), aujourd'hui surligné cheddar. Couleurs du schéma courant. */
export function HoursGrid({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const hours = useAdminStore((s) => s.hours.restaurant);
  const today = hydrated ? parisNow().day : -1;
  return (
    <dl className={cn("grid grid-cols-2 border-t border-l border-fg/20 sm:grid-cols-4 lg:grid-cols-7", className)}>
      {DAY_ORDER.map((d) => {
        const ranges = hours[d];
        const isToday = d === today;
        return (
          <div key={d} className={cn("border-r border-b border-fg/20 p-3 md:p-4", isToday && "bg-cheddar text-ink")}>
            <dt className="kicker flex items-center justify-between gap-2">
              {DAY_NAMES[d]}
              {isToday && <span className="text-[0.55rem]">Auj.</span>}
            </dt>
            <dd className={cn("mt-3 font-display text-lg leading-[1.15] tabular-nums md:text-xl", ranges.length === 0 && "opacity-45")}>
              {ranges.length === 0
                ? "Fermé"
                : ranges.map((r) => (
                    <span key={r.open} className="block">
                      {r.open.replace(":", "h")}–{r.close.replace(":", "h")}
                    </span>
                  ))}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
