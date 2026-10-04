"use client";

import { Clock, Phone } from "lucide-react";
import { useSite } from "@/features/site-context";
import { useOrderingNotice } from "@/features/store/use-status";
import { useSlots } from "@/features/checkout/use-slots";
import { OpenStatus } from "@/components/store/OpeningHours";
import { cn } from "@/lib/utils";

/** Bandeau d'état : ouvert / fermé, délai de préparation, prochain créneau, commandes en ligne coupées. */
export function OrderingStatus({ className }: { className?: string }) {
  const { store } = useSite();
  const notice = useOrderingNotice();
  const { data } = useSlots({ refreshMs: 120_000 });
  const next = data?.asap ?? data?.slots.find((s) => s.available) ?? null;

  if (notice) {
    return (
      <div role="status" className={cn("on-dark flex flex-col gap-3 bg-ink px-5 py-4 text-fg sm:flex-row sm:items-center sm:justify-between", className)}>
        <p className="text-[0.95rem] font-semibold">{notice}</p>
        <a href={store.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-brass">
          <Phone className="size-4" aria-hidden /> Commander par téléphone : {store.phone}
        </a>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-2 border border-rule bg-paper px-5 py-3.5", className)}>
      <OpenStatus />
      <p className="inline-flex items-center gap-2 text-[0.82rem] text-sub">
        <Clock className="size-4" aria-hidden strokeWidth={1.5} />
        Retrait au restaurant · prêt en {store.prepMinutes} min environ{store.busyMode ? " (forte affluence)" : ""}
      </p>
      {data && (
        <p className="text-[0.82rem] text-sub">
          {next ? (
            <>
              Prochain retrait possible : <span className="font-semibold text-fg">{next.dayLabel === "Aujourd’hui" ? "aujourd’hui" : next.dayLabel} à {next.label.replace(":", "h")}</span>
            </>
          ) : (
            "Plus de créneau disponible en ligne pour le moment."
          )}
        </p>
      )}
    </div>
  );
}
