"use client";

import { useEffect, useState } from "react";
import { useDemo } from "@/features/demo/store";
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

/** Libellé des boutons « Commander » quand la commande en ligne est fermée. */
export const ORDERING_CLOSED_LABEL = "Commandes temporairement fermées";

/**
 * Message bloquant à afficher côté client, ou null si la commande en ligne est possible.
 * Fermée si : interrupteur OFF, retrait désactivé, temps de préparation non configuré, aucun moyen de paiement.
 * En démonstration, seul l'interrupteur de la cuisine de démo compte.
 */
export function useOrderingNotice(): string | null {
  const { store } = useSite();
  const demo = useDemo((s) => s.active);
  const demoOpen = useDemo((s) => s.ordersEnabled);
  if (demo) return demoOpen ? null : "Démonstration : les commandes ont été coupées depuis l’écran cuisine.";
  if (!store.onlineOrderingEnabled || !store.pickupEnabled || store.prepMinutes === null || store.paymentMethods.length === 0) {
    return "Les commandes en ligne sont temporairement fermées. Le restaurant reste joignable par téléphone.";
  }
  return null;
}
