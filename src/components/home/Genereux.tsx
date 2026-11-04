"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { CinemaPicture } from "./CinemaPicture";
import { QuietLink } from "./Cta";

/**
 * Deuxième séquence, changement de rythme : le cadre s'élargit jusqu'au plein écran pendant que le mot
 * recule, comme un travelling compensé. Tout est lié au défilement, qui n'est jamais retenu ; les deux seules
 * issues mènent vers le reste du site.
 */
export function Genereux() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;
      const opening = { trigger: root.current, start: "top 92%", end: "top 8%", scrub: true };
      gsap.fromTo("[data-frame]", { clipPath: "inset(13% 11% 13% 11% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: opening });
      gsap.fromTo("[data-word]", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: opening });
      gsap.fromTo("[data-sign]", { xPercent: 14 }, { xPercent: 0, ease: "none", scrollTrigger: opening });
      gsap.fromTo("[data-drift]", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="dark" aria-labelledby="genereux-title" className="on-dark relative isolate h-svh min-h-[36rem] overflow-hidden bg-ink">
      <div data-frame className="absolute inset-0 -z-10 overflow-hidden">
        <div data-drift className="absolute -inset-y-[7%] inset-x-0">
          <CinemaPicture id="table-desktop" portraitId="table-mobile" sizes="100vw" alt="Scène d’ambiance : une table le soir, couverte de barquettes de burgers et de frites" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgb(10_8_6/0.62)_0%,rgb(10_8_6/0.28)_100%)]" />
      </div>

      <div className="absolute inset-0 grid place-items-center overflow-hidden">
        <h2 id="genereux-title" className="relative flex flex-col items-center text-cream">
          <span data-word className="block font-display text-[clamp(5rem,25vw,28rem)] leading-[0.92] uppercase will-change-transform">
            Généreux
          </span>
          <span data-sign className="-mt-[0.2em] block self-end pr-[0.06em] font-serif text-[clamp(2.6rem,9.5vw,10.5rem)] leading-none italic">
            par nature.
          </span>
        </h2>
      </div>

      <div className="container-cine absolute inset-x-0 bottom-0 flex flex-wrap justify-between gap-x-8 gap-y-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-8">
        <QuietLink href="/restaurant">Le restaurant</QuietLink>
        <QuietLink href="/galerie">La galerie</QuietLink>
      </div>
    </section>
  );
}
