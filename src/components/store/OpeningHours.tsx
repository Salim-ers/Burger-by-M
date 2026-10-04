"use client";

import { useSite } from "@/features/site-context";
import { useOpeningStatus } from "@/features/store/use-status";
import { useHydrated } from "@/hooks/use-hydrated";
import { DAY_NAMES, DAY_ORDER, formatHour, formatRanges, parisParts, rangesForDate, TIMEZONE } from "@/lib/schedule";
import { cn } from "@/lib/utils";

/** « Ouvert · jusqu’à 22h » / « Fermé · ouvre demain à 18h » (heure de Paris, calculé après hydratation). */
export function OpenStatus({ className }: { className?: string }) {
  const status = useOpeningStatus();
  return (
    <p className={cn("inline-flex min-h-6 items-center gap-2.5 text-[0.82rem] font-semibold", className)} aria-live="polite">
      {status.ready && (
        <>
          <span aria-hidden className={cn("relative size-2 rounded-full", status.isOpen ? "bg-open" : "bg-closed")}>
            {status.isOpen && <span className="absolute inset-0 animate-ping rounded-full bg-open/60 motion-reduce:hidden" />}
          </span>
          {status.isOpen ? (
            <span>
              Ouvert{status.closesAt ? ` · jusqu’à ${formatHour(status.closesAt)}` : ""}
            </span>
          ) : (
            <span>
              Fermé{status.nextOpeningLabel ? ` · ouvre ${status.nextOpeningLabel}` : ""}
            </span>
          )}
        </>
      )}
    </p>
  );
}

/** Semaine type (lundi → dimanche), jour courant mis en avant. */
export function OpeningHours({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { store } = useSite();
  const hydrated = useHydrated();
  const today = hydrated ? parisParts(new Date()).dayOfWeek : null;
  return (
    <dl className={cn("border-t border-rule", className)}>
      {DAY_ORDER.map((d) => {
        const ranges = store.schedule.weekly.filter((r) => r.dayOfWeek === d).sort((a, b) => a.opensAt.localeCompare(b.opensAt));
        const isToday = d === today;
        return (
          <div key={d} className={cn("flex items-baseline justify-between gap-6 border-b border-rule py-3 text-[0.95rem]", isToday && (tone === "dark" ? "text-brass" : "font-semibold"))}>
            <dt className={cn(!isToday && "text-sub")}>
              {DAY_NAMES[d]}
              {isToday && <span className="kicker ml-3 text-[0.6rem] text-brass-deep">Aujourd’hui</span>}
            </dt>
            <dd className="text-right tabular-nums">{formatRanges(ranges)}</dd>
          </div>
        );
      })}
    </dl>
  );
}

const specialFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: TIMEZONE, weekday: "long", day: "numeric", month: "long" });

/** Fermetures et horaires exceptionnels des 30 prochains jours. */
export function UpcomingSpecials({ className }: { className?: string }) {
  const { store } = useSite();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const todayYmd = parisParts(new Date()).ymd;
  const limit = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const days = [...new Set(store.schedule.specials.map((s) => s.date))].filter((d) => d >= todayYmd && d <= limit).slice(0, 4);
  if (days.length === 0) return null;
  return (
    <div className={cn("border border-brass/50 bg-brass/[0.06] px-5 py-4", className)}>
      <p className="kicker text-brass-deep">Horaires exceptionnels</p>
      <ul className="mt-3 space-y-1.5 text-[0.92rem]">
        {days.map((d) => {
          const note = store.schedule.specials.find((s) => s.date === d && s.note)?.note;
          const label = specialFormatter.format(new Date(`${d}T12:00:00Z`));
          return (
            <li key={d} className="flex flex-wrap justify-between gap-x-6">
              <span className="first-letter:uppercase">{label}</span>
              <span className="tabular-nums">
                {formatRanges(rangesForDate(d, store.schedule))}
                {note ? ` — ${note}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
