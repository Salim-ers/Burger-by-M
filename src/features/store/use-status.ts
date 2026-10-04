"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/features/site-context";
import { getOpeningStatus, type OpeningStatus } from "@/lib/schedule";

/** Statut d'ouverture calculé dans le navigateur (heure de Paris), rafraîchi chaque minute. */
export function useOpeningStatus(): (OpeningStatus & { ready: true }) | { ready: false } {
  const { store } = useSite();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return { ready: false };
  return { ready: true, ...getOpeningStatus(now, store.schedule) };
}

/** Message bloquant à afficher côté client, ou null si la commande en ligne est possible. */
export function useOrderingNotice(): string | null {
  const { store } = useSite();
  if (!store.onlineOrderingEnabled || !store.pickupEnabled) return "Les commandes en ligne sont momentanément indisponibles.";
  if (store.paymentMethods.length === 0) return "Les commandes en ligne sont momentanément indisponibles.";
  return null;
}
