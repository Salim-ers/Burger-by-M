"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_MASK, reducedMotion } from "@/components/motion/gsap";
import { CinemaPicture } from "./CinemaPicture";

/**
 * Première séquence : le moment où tout commence. La photographie se découvre de bas en haut pendant que
 * la phrase se lève, puis se déplace légèrement au défilement. Une image, une phrase.
 */
export function Plancha() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 72%", once: true } });
      tl.fromTo("[data-frame]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: EASE_MASK })
        .from("[data-zoom]", { scale: 1.16, duration: 2.2, ease: "expo.out" }, 0.1)
        .from(".mask-line > span", { yPercent: 112, duration: 1.2, stagger: 0.09 }, 0.55);
      gsap.fromTo("[data-drift]", { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="dark" aria-labelledby="plancha-title" className="on-dark relative overflow-clip bg-ink pt-[clamp(1.5rem,6vh,5rem)] pb-[clamp(5rem,16vh,12rem)]">
      <div className="container-cine grid grid-cols-12">
        <div data-frame className="relative col-span-12 col-start-1 row-start-1 -mx-[var(--gutter)] aspect-[4/5] overflow-hidden md:col-span-7 md:col-start-6 md:mx-0 md:max-h-[92svh] md:rounded-[clamp(0.75rem,1.2vw,1.25rem)]">
          <div data-drift className="absolute -inset-y-[6%] inset-x-0">
            <div data-zoom className="absolute inset-0">
              <CinemaPicture id="plancha" sizes="(min-width: 768px) 58vw, 100vw" alt="Scène d’ambiance : deux steaks hachés écrasés sur la plancha, le cheddar commence à fondre" />
            </div>
          </div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_8_6/0.82)_0%,rgb(10_8_6/0.25)_38%,transparent_60%)] md:bg-[linear-gradient(to_right,rgb(10_8_6/0.7)_0%,transparent_46%)]" />
        </div>

        <h2 id="plancha-title" className="relative z-10 col-span-12 col-start-1 row-start-1 self-end pb-6 md:col-span-9 md:col-start-1 md:pb-[clamp(2rem,5vw,5rem)] font-serif text-[13vw] leading-[0.96] md:text-[clamp(3.1rem,8.2vw,11rem)] tracking-[-0.018em] text-cream">
          <span className="mask-line">
            <span>Votre burger</span>
          </span>
          <span className="mask-line">
            <span>commence quand</span>
          </span>
          <span className="mask-line">
            <span>
              vous <em className="pr-[0.08em]">commandez.</em>
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
