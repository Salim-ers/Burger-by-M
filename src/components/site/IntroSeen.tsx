"use client";

import { useEffect } from "react";

/** Après la première intro, elle ne se rejoue plus (même en revenant sur l'accueil sans recharger). */
export function IntroSeen() {
  useEffect(() => {
    const id = window.setTimeout(() => document.documentElement.classList.add("intro-seen"), 1700);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
