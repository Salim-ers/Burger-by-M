"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/stores/admin-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { getOpeningState, type OpeningState } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** « ■ OUVERT · ferme à 22:00 » / « ■ FERMÉ · ouvre demain à 18:00 » — calculé depuis les horaires configurés. */
export function OpeningStatus({ className, compact }: { className?: string; compact?: boolean }) {
  const hydrated = useHydrated();
  const hours = useAdminStore((s) => s.hours.restaurant);
  const [state, setState] = useState<OpeningState | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const update = () => setState(getOpeningState(hours));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [hydrated, hours]);

  if (!state) return <span className={cn("inline-block h-5 w-36", className)} aria-hidden />;

  return (
    <span className={cn("inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.14em] uppercase", className)}>
      <span className="relative flex size-2">
        {state.open && <span className="absolute inset-0 animate-ping bg-success opacity-60" />}
        <span className={cn("relative size-2", state.open ? "bg-success" : "bg-steel")} />
      </span>
      <span>{state.open ? "Ouvert" : "Fermé"}</span>
      {!compact && (
        <span className="font-medium tracking-[0.06em] normal-case opacity-60">
          {state.open ? `ferme à ${state.closesAt}` : state.opensLabel ? state.opensLabel.replace("Ouvre", "ouvre") : ""}
        </span>
      )}
    </span>
  );
}
