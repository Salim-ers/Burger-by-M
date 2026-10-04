"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** GSAP + ScrollTrigger, enregistrés une seule fois côté navigateur. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
}

export { gsap, ScrollTrigger, useGSAP };

/** Courbes maison : « food » (sortie douce) et « mask » (volets, masques). */
export const EASE_FOOD = "expo.out";
export const EASE_MASK = "power4.inOut";

export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desktop à pointeur fin : seul contexte où le défilement doux et le curseur sont activés. */
export function finePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
