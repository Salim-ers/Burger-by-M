"use client";

import { useSyncExternalStore } from "react";

/**
 * Consentement aux contenus tiers (RGPD) : seule la carte Google Maps est concernée.
 * Aucun outil de mesure d'audience ni de publicité n'est chargé par le site.
 * Le choix reste dans ce navigateur (localStorage) et peut être retiré depuis /legal/cookies.
 */
export type ConsentKey = "maps";
const KEY = "bym-consent";
const listeners = new Set<() => void>();

function read(): Partial<Record<ConsentKey, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Record<ConsentKey, boolean>>;
  } catch {
    return {};
  }
}

export function setConsent(key: ConsentKey, value: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), [key]: value }));
  } catch {
    /* stockage indisponible : le choix vaut pour la page en cours */
  }
  memory[key] = value;
  listeners.forEach((l) => l());
}

const memory: Partial<Record<ConsentKey, boolean>> = {};

export function useConsent(key: ConsentKey): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => e.key === KEY && cb();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => memory[key] ?? read()[key] === true,
    () => false,
  );
}
