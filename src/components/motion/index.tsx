"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_MASK, reducedMotion, finePointer } from "./gsap";
import { cn } from "@/lib/utils";

/**
 * Bibliothèque de mouvements Burger By M — chaque effet a une raison :
 * le texte se révèle comme une recette qu'on lit, l'image se dévoile comme une assiette qu'on pose.
 * En mouvement réduit, tout est affiché sans animation.
 */

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span";

/** Titre révélé ligne par ligne (masque vertical). */
export function RevealText({ lines, as = "h2", className, delay = 0, stagger = 0.08, id, start = "top 85%" }: { lines: React.ReactNode[]; as?: Tag; className?: string; delay?: number; stagger?: number; id?: string; start?: string }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      gsap.from(ref.current.querySelectorAll(".mask-line > span"), { yPercent: 108, duration: 1.15, stagger, delay, scrollTrigger: { trigger: ref.current, start, once: true } });
    },
    { scope: ref },
  );
  const Comp = as as "h2";
  return (
    <Comp ref={ref as React.Ref<HTMLHeadingElement>} id={id} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line">
          <span>{l}</span>
        </span>
      ))}
    </Comp>
  );
}

/** Apparition douce (fondu + légère montée). */
export function FadeIn({ children, className, delay = 0, y = 24, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; y?: number; as?: Tag | "li" | "section" }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion() || !ref.current) return;
      gsap.from(ref.current, { autoAlpha: 0, y, duration: 0.9, delay, scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } });
    },
    { scope: ref },
  );
  const Comp = as as "div";
  return (
    <Comp ref={ref as React.Ref<HTMLDivElement>} className={className}>
      {children}
    </Comp>
  );
}

/**
 * Image dévoilée : un volet de la couleur du fond traverse l'image, qui se pose (léger zoom → 1).
 * `panel` : couleur du volet (crème, noir…).
 */
export function RevealImage({ children, className, style, panel = "var(--cream)", direction = "left", parallax = 0 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; panel?: string; direction?: "left" | "up"; parallax?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const cover = el.querySelector<HTMLElement>("[data-cover]");
      const media = el.querySelector<HTMLElement>("[data-media]");
      if (reducedMotion()) {
        if (cover) cover.style.display = "none";
        return;
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      tl.fromTo(cover, direction === "left" ? { scaleX: 1 } : { scaleY: 1 }, { ...(direction === "left" ? { scaleX: 0 } : { scaleY: 0 }), duration: 0.85, ease: EASE_MASK }).from(media, { scale: 1.12, duration: 1.4, ease: "expo.out" }, 0.05);
      if (parallax && media) {
        gsap.fromTo(media, { yPercent: -parallax }, { yPercent: parallax, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      }
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} style={style}>
      <div data-media className={cn("absolute inset-0", parallax && "-inset-y-[8%]")}>
        {children}
      </div>
      <div data-cover aria-hidden className={cn("absolute inset-0 z-10", direction === "left" ? "origin-right" : "origin-top")} style={{ background: panel }} />
    </div>
  );
}

/** Attraction magnétique très légère (quelques pixels) — desktop. */
export function Magnetic({ children, className, strength = 6 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion() || !finePointer()) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * strength);
        yTo(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn("inline-flex", className)}>
      {children}
    </div>
  );
}
