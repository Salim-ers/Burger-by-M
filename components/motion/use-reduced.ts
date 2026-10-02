"use client";

import { useReducedMotion } from "framer-motion";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * prefers-reduced-motion sans écart d'hydratation : renvoie false au rendu serveur
 * et au premier rendu client, puis la vraie préférence.
 */
export function useReduce() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated && Boolean(reduce);
}
