"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion, finePointer } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion";
import { useOrderingNotice } from "@/features/store/use-status";
import { brand } from "@/data/brand";
import { CinemaPicture, CinemaPreload } from "./CinemaPicture";
import { GoogleRating } from "./GoogleRating";
import { Cta } from "./Cta";

/** Lettres révélées une à une, derrière un masque. Le texte reste lu d'un seul tenant par les lecteurs d'écran. */
function Letters({ text, from }: { text: string; from: number }) {
  return (
    <>
      {Array.from(text).map((char, i) =>
        char === " " ? (
          <span key={i} aria-hidden className="cine-space" />
        ) : (
          <span key={i} aria-hidden className="cine-char" style={{ "--c": from + i } as React.CSSProperties}>
            {char}
          </span>
        ),
      )}
    </>
  );
}

/**
 * HERO — une photographie, une phrase, deux actions.
 * Le logo apparaît sur le noir, le cadre s'ouvre comme une ouverture de cinéma sur une scène, la caméra
 * finit de se poser, le titre se lève. L'animation est en CSS : elle ne dépend pas du JavaScript et ne
 * bloque rien (les boutons sont dans la page dès le départ, le défilement n'est jamais retenu).
 * Au défilement et au pointeur, le cadre se déplace à peine, pour la profondeur.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const notice = useOrderingNotice();

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;
      const pass = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to("[data-hero-scroll]", { yPercent: 9, ease: "none", scrollTrigger: pass });
      gsap.to("[data-hero-copy]", { yPercent: -10, autoAlpha: 0, ease: "none", scrollTrigger: { ...pass, end: "65% top" } });

      if (!finePointer()) return;
      const xTo = gsap.quickTo("[data-hero-pointer]", "x", { duration: 1.6, ease: "power3.out" });
      const yTo = gsap.quickTo("[data-hero-pointer]", "y", { duration: 1.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * -18);
        yTo((e.clientY / window.innerHeight - 0.5) * -10);
      };
      const el = root.current;
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="dark" aria-labelledby="hero-title" className="cine-hero on-dark relative isolate h-svh min-h-[34rem] overflow-hidden bg-ink">
      <CinemaPreload landscape="hero-desktop" portrait="hero-mobile" sizes="100vw" />

      <div className="cine-aperture absolute inset-0 -z-10">
        <div data-hero-scroll className="absolute inset-0">
          <div data-hero-pointer className="absolute -inset-[1.5%]">
            <div className="cine-camera absolute inset-0">
              <CinemaPicture
                id="hero-desktop"
                portraitId="hero-mobile"
                priority
                sizes="100vw"
                position="100% 50%"
                alt="Scène d’ambiance : un burger au cheddar fondu sur une table, devant le comptoir et l’enseigne lumineuse Burger By M, le soir"
              />
            </div>
          </div>
        </div>
        <div aria-hidden className="cine-shade absolute inset-0" />
      </div>

      <div aria-hidden className="cine-logo">
        {/* eslint-disable-next-line @next/next/no-img-element -- doit s'afficher immédiatement, sans passer par l'optimiseur */}
        <img src={brand.logo.src} alt="" width={200} height={200} fetchPriority="high" decoding="sync" className="size-40 md:size-[200px]" />
      </div>

      <div data-hero-copy className="container-cine relative flex h-full flex-col justify-end pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-[clamp(2rem,5svh,4rem)]">
        <div className="flex flex-col gap-5 md:gap-6">
          <h1 id="hero-title" className="cine-title">
            <span className="sr-only">Burger By M, smash burgers à Rantigny. Le goût qui marque.</span>
            <span className="cine-line">
              <Letters text="Le goût" from={0} />
            </span>
            <span className="cine-line">
              <Letters text="qui " from={7} />
              <span aria-hidden className="cine-char text-pink" style={{ "--c": 11 } as React.CSSProperties}>
                M
              </span>
              <Letters text="arque." from={12} />
            </span>
          </h1>

          <div className="cine-enter flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="cine-sentence text-[1rem] leading-snug text-cream md:text-[1.1rem] min-[1800px]:text-[1.4rem]">Smash burgers préparés à la commande, à Rantigny.</p>
              <GoogleRating />
            </div>
            <div className="flex gap-2.5 max-[359px]:flex-col sm:flex-wrap">
              <Magnetic className="min-w-0 flex-1 sm:flex-none">
                <Cta href="/menu" label={notice ? "Commandes fermées" : "Commander"} tone={notice ? "glass" : "solid"} className="w-full sm:w-auto" />
              </Magnetic>
              <Magnetic className="min-w-0 flex-1 sm:flex-none">
                <Cta href="/menu" label="Découvrir la carte" tone="glass" className="w-full sm:w-auto" />
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
