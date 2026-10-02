"use client";

import { useEffect, useState } from "react";
import { useOrdering } from "./use-menu";
import { useHydrated } from "./use-hydrated";
import { formatHour, formatRangesShort, getOpeningState, nextOpening, parisNow } from "@/lib/hours";
import { orderingDefaults } from "@/data/restaurant";

export interface StoreStatus {
  /** false tant que l'heure locale n'est pas connue (rendu serveur / premier rendu). */
  ready: boolean;
  open: boolean;
  /** « 11h – 14h · 18h – 22h » */
  today: string;
  /** « 15–25 min » */
  prepRange: string;
  /** Les commandes en ligne sont possibles maintenant. */
  canOrder: boolean;
  /** Message affiché quand on ne peut pas commander. */
  blockedMessage: string | null;
}

/** Statut du restaurant et de la prise de commande, recalculé chaque minute depuis les horaires configurés. */
export function useStoreStatus(): StoreStatus {
  const hydrated = useHydrated();
  const { accepting, prepMinutes, hours } = useOrdering();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const spread = orderingDefaults.prepSpreadMinutes;
  const prepRange = `${Math.max(5, prepMinutes - spread)}–${prepMinutes + spread} min`;

  if (!hydrated || !now) {
    return { ready: false, open: false, today: "", prepRange, canOrder: false, blockedMessage: null };
  }

  const state = getOpeningState(hours.restaurant, now);
  const today = formatRangesShort(hours.restaurant[parisNow(now).day as 0 | 1 | 2 | 3 | 4 | 5 | 6]);
  const next = nextOpening(hours.clickAndCollect, now);
  const canOrder = accepting && (state.open || orderingDefaults.allowOrdersWhenClosed);

  let blockedMessage: string | null = null;
  if (!accepting) blockedMessage = "Les commandes en ligne sont momentanément suspendues.";
  else if (!canOrder) blockedMessage = next ? `Les commandes reprendront ${next.when} à ${formatHour(next.time)}.` : "Les commandes en ligne sont fermées pour le moment.";

  return { ready: true, open: state.open, today, prepRange, canOrder, blockedMessage };
}
