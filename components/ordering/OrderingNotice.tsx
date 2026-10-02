"use client";

import { AlertTriangle, Flame } from "lucide-react";
import { useOrdering } from "@/hooks/use-menu";
import { useStoreStatus } from "@/hooks/use-store-status";
import { restaurant } from "@/data/restaurant";

/** Prévient le client quand la commande en ligne est impossible, ou en cas de forte affluence. */
export function OrderingNotice() {
  const { rush } = useOrdering();
  const status = useStoreStatus();
  if (!status.ready) return null;
  if (!status.canOrder) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-lg bg-closed/8 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-closed" aria-hidden />
        <p>
          <strong className="font-semibold">{status.blockedMessage}</strong> Pour toute question :{" "}
          <a href={restaurant.phone.href} className="font-semibold underline">
            {restaurant.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }
  if (rush) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-lg bg-ink/5 p-4 text-sm">
        <Flame className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          <strong className="font-semibold">Forte affluence.</strong> Temps de préparation actuel : {status.prepRange}.
        </p>
      </div>
    );
  }
  return null;
}
