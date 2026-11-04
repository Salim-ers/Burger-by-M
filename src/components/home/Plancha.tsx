"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_MASK, reducedMotion } from "@/components/motion/gsap";
import { CinemaPicture } from "./CinemaPicture";

/**
 * Première séquence : le moment où tout commence. La photographie occupe tout le cadre et se découvre de bas en
 * haut ; la phrase reste discrète dans un coin. Au défilement, l'image se déplace à peine.
 */
export function Plancha() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
      tl.fromTo("[data-frame]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: EASE_MASK })
        .from("[data-zoom]", { scale: 1.1, duration: 2.2, ease: "expo.out" }, 0.1)
        .from(".mask-line > span", { yPercent: 112, duration: 1.1, stagger: 0.08 }, 0.6);
      gsap.fromTo("[data-drift]", { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="dark" aria-labelledby="plancha-title" className="on-dark relative h-[94svh] min-h-[30rem] overflow-hidden bg-ink">
      <div data-frame className="absolute inset-0 overflow-hidden">
        <div data-drift className="absolute -inset-y-[5%] inset-x-0">
          <div data-zoom className="absolute inset-0">
            <CinemaPicture id="plancha-desktop" portraitId="plancha" sizes="100vw" alt="Scène d’ambiance : des steaks hachés écrasés sur la plancha, le cheddar commence à fondre" />
          </div>
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.82)_0%,rgb(10_10_10/0.28)_26%,transparent_46%)] md:bg-[radial-gradient(58%_70%_at_0%_100%,rgb(10_10_10/0.82)_0%,rgb(10_10_10/0.4)_55%,transparent_100%)]" />
      </div>

      <h2 id="plancha-title" className="container-cine absolute inset-x-0 bottom-0 pb-[clamp(1.75rem,6vh,4rem)] text-[clamp(1.9rem,3.3vw,3.75rem)] leading-[1.12] font-semibold tracking-[-0.015em] text-cream">
        <span className="mask-line">
          <span>Votre burger commence</span>
        </span>
        <span className="mask-line">
          <span>quand vous commandez.</span>
        </span>
      </h2>
    </section>
  );
}
