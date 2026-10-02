"use client";

import { Clock, Store, Timer } from "lucide-react";
import { StatusDot } from "@/components/ui/OpeningStatus";
import { useStoreStatus } from "@/hooks/use-store-status";
import { cn } from "@/lib/utils";

/** Bandeau d'état du restaurant : ● OUVERT · Aujourd'hui · Retrait sur place · Temps estimé. */
export function StatusStrip({ className }: { className?: string }) {
  const s = useStoreStatus();
  return (
    <div className={cn("border-y border-line bg-white", className)} aria-live="polite">
      <div className="shell flex min-h-14 flex-wrap items-center gap-x-5 gap-y-2 py-3 text-[0.9rem] md:justify-center md:gap-x-8">
        {s.ready ? (
          <>
            <span className="flex items-center gap-2">
              <StatusDot open={s.open} />
              <span className={cn("font-bold tracking-wide uppercase", s.open ? "text-open" : "text-closed")}>{s.open ? "Ouvert" : "Fermé"}</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-muted" aria-hidden />
              <span>
                Aujourd’hui : <strong className="font-semibold">{s.today}</strong>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Store className="size-4 shrink-0 text-muted" aria-hidden />
              Retrait sur place
            </span>
            <span className="flex items-center gap-2">
              <Timer className="size-4 shrink-0 text-muted" aria-hidden />
              <span>
                Temps estimé : <strong className="font-semibold">{s.prepRange}</strong>
              </span>
            </span>
          </>
        ) : (
          <span className="h-5" aria-hidden />
        )}
      </div>
      {s.ready && s.blockedMessage && (
        <p className="border-t border-line bg-cream/60 py-2.5 text-center text-[0.9rem] font-semibold text-closed">{s.blockedMessage}</p>
      )}
    </div>
  );
}
