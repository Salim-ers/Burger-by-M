"use client";

import { useSite } from "@/features/site-context";
import { useOpeningStatus, useOrderingNotice } from "@/features/store/use-status";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatHour, formatRanges, parisParts, rangesForDate } from "@/lib/schedule";
import { cn } from "@/lib/utils";

/**
 * Barre restaurant compacte : ● OUVERT · Aujourd’hui 18h–22h · Retrait · ≈ 20 min.
 * Toutes les valeurs viennent des réglages et horaires en base ; rien d'estimé par défaut.
 */
export function RestaurantBar({ className }: { className?: string }) {
  const { store } = useSite();
  const status = useOpeningStatus();
  const notice = useOrderingNotice();
  const hydrated = useHydrated();
  const today = hydrated ? formatRanges(rangesForDate(parisParts(new Date()).ymd, store.schedule)) : null;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-rule py-3.5", className)}>
      <p className="t-label inline-flex items-center gap-2" aria-live="polite">
        {status.ready && <span aria-hidden className={cn("size-2 rounded-full", status.isOpen ? "bg-open" : "bg-closed")} />}
        {status.ready ? (status.isOpen ? `Ouvert${status.closesAt ? ` · jusqu’à ${formatHour(status.closesAt)}` : ""}` : `Fermé${status.nextOpeningLabel ? ` · ouvre ${status.nextOpeningLabel}` : ""}`) : " "}
      </p>
      {today && <p className="t-label text-sub">Aujourd’hui {today}</p>}
      {store.pickupEnabled && <p className="t-label text-sub">Retrait sur place</p>}
      {store.prepMinutes !== null && !notice && <p className="t-label text-sub">≈ {store.prepMinutes} min{store.busyMode ? " · forte affluence" : ""}</p>}
      {notice && (
        <p className="t-label ml-auto flex flex-wrap items-center gap-x-3 text-closed">
          Commandes temporairement fermées
          <a href={store.phoneHref} className="text-fg underline underline-offset-4">
            {store.phone}
          </a>
        </p>
      )}
    </div>
  );
}
