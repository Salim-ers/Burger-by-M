"use client";

import { useEffect, useState } from "react";

/** true après le premier rendu client : évite les écarts d'hydratation (localStorage, heure locale). */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
