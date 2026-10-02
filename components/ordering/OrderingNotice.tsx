"use client";

import { AlertTriangle, Flame } from "lucide-react";
import { useOrdering } from "@/hooks/use-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { restaurant } from "@/data/restaurant";

/** Informe le client si la prise de commande est suspendue ou en mode « coup de feu ». */
export function OrderingNotice() {
  const hydrated = useHydrated();
  const { accepting, rush, prepMinutes } = useOrdering();
  if (!hydrated) return null;
  if (!accepting) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-sm border border-danger/40 bg-danger/10 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ff9b94]" aria-hidden />
        <p>
          <strong className="font-semibold">Les commandes en ligne sont momentanément suspendues.</strong> Appelle-nous au{" "}
          <a href={restaurant.phone.href} className="underline">
            {restaurant.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }
  if (rush) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-sm border border-cheddar/40 bg-cheddar/10 p-4 text-sm">
        <Flame className="mt-0.5 size-5 shrink-0 text-cheddar" aria-hidden />
        <p>
          <strong className="font-semibold">Grosse affluence.</strong> Temps de préparation actuel : environ {prepMinutes} minutes.
        </p>
      </div>
    );
  }
  return null;
}
