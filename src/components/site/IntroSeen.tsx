"use client";

import { useEffect } from "react";

/**
 * Une fois l'ouverture terminée, elle ne se rejoue plus, même en revenant sur l'accueil sans recharger.
 * Le minuteur n'est pas annulé si l'on quitte la page avant la fin : il ne fait que poser une classe.
 */
export function IntroSeen() {
  useEffect(() => {
    window.setTimeout(() => document.documentElement.classList.add("intro-seen"), 8000);
  }, []);
  return null;
}
