"use client";

import { useCallback, useEffect, useState } from "react";
import type { PickupSlot } from "@/lib/schedule";

/** Réponse de GET /api/slots (calculée côté serveur : horaires, préparation, capacité). */
export interface SlotsResponse {
  canOrder: boolean;
  onlineOrderingEnabled: boolean;
  isOpen: boolean;
  nextOpening: string | null;
  prepMinutes: number;
  asap: PickupSlot | null;
  slots: PickupSlot[];
  paymentMethods: ("card" | "on_site")[];
  minOrderCents: number;
}

export function useSlots({ refreshMs = 60_000 }: { refreshMs?: number } = {}) {
  const [data, setData] = useState<SlotsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/slots", { cache: "no-store" });
      const body = (await res.json()) as SlotsResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Créneaux indisponibles pour le moment.");
      setData(body);
      setError(null);
      return body;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Créneaux indisponibles pour le moment.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!refreshMs) return;
    const id = window.setInterval(() => void refresh(), refreshMs);
    return () => window.clearInterval(id);
  }, [refresh, refreshMs]);

  return { data, error, loading, refresh };
}
