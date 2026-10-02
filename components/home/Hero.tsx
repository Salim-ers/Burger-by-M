"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { Magnetic } from "@/components/motion/Magnetic";
import { shots } from "@/data/images";
import { restaurant } from "@/data/restaurant";

const hero = shots.heroBurger;

/**
 * 01 — HERO CINÉMATIQUE.
 * Intro CSS (avant hydratation, ≈ 1 s) : écran noir → logo → wipe horizontal → photo en clip-path → titre ligne à ligne.
 * Composition asymétrique : titre géant à gauche, burger énorme à droite qui sort du cadre.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useScrollMap(scrollYProgress, [0, 1], ["0%", "18%"]);
  const photoScale = useScrollMap(scrollYProgress, [0, 1], [1, 1.1]);
  const titleY = useScrollMap(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const fade = useScrollMap(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} aria-label="Burger By M" className="scheme-dark relative min-h-[100svh] overflow-hidden bg-ink lg:h-[100svh] lg:min-h-[680px]">
      {/* Intro : écran noir + logo, puis wipe horizontal. */}
      <div className="intro" aria-hidden>
        <Logo size={96} priority />
      </div>

      {/* Photo : 58 % de la largeur sur desktop, plein cadre en haut sur mobile. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[66svh] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-[58%]"
        style={reduce ? undefined : { y: photoY }}
      >
        <div className="hero-clip absolute inset-0 overflow-hidden" data-cursor="view">
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: photoScale }}>
            <div className="hero-zoom absolute inset-0 origin-[70%_55%]">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover lg:scale-[1.08] lg:origin-[85%_55%]"
                style={{ objectPosition: hero.position }}
              />
            </div>
          </motion.div>
          {/* Fondu vers le noir : à gauche sur desktop, en bas sur mobile. */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent lg:inset-y-0 lg:right-auto lg:h-full lg:w-2/5 lg:bg-gradient-to-r" />
          <span aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/70 to-transparent" />
        </div>

        <p className="fade-up absolute right-4 bottom-4 hidden items-center gap-3 text-bone/80 lg:right-8 lg:bottom-8 lg:flex" style={{ "--d": "0.95s" } as React.CSSProperties}>
          <span className="kicker">N°01 — Le Spécial</span>
          <span className="h-px w-10 bg-bone/40" />
          <span className="font-display text-xl">11,90 €</span>
        </p>
      </motion.div>

      <motion.div className="shell relative flex min-h-[100svh] flex-col justify-end pt-[44svh] pb-24 lg:h-full lg:min-h-0 lg:pt-28 lg:pb-12" style={reduce ? undefined : { opacity: fade }}>
        {/* Infos en petit */}
        <div className="fade-up absolute top-28 left-[clamp(1rem,3.2vw,3rem)] hidden gap-12 lg:flex" style={{ "--d": "0.8s" } as React.CSSProperties}>
          <p className="kicker leading-[1.7] text-bone/70">
            {restaurant.address.street}
            <br />
            {restaurant.address.postalCode} {restaurant.address.city}
          </p>
          <p className="kicker leading-[1.7] text-bone/70">
            Smash burgers
            <br />
            Frenchy’s
            <br />
            Shakes
          </p>
        </div>

        <motion.h1 className="relative font-display text-[clamp(5.4rem,26vw,10rem)] leading-[0.84] text-bone lg:text-[clamp(8rem,16.5vw,17.5rem)]" style={reduce ? undefined : { y: titleY }}>
          <span className="line-mask" style={{ "--i": 0 } as React.CSSProperties}>
            <span>Burger</span>
          </span>
          <span className="line-mask" style={{ "--i": 1 } as React.CSSProperties}>
            <span>
              By M<span className="text-cheddar">.</span>
            </span>
          </span>
        </motion.h1>

        <div className="fade-up mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-end lg:justify-between" style={{ "--d": "0.85s" } as React.CSSProperties}>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <ButtonLink href="/commander" variant="primary" size="lg" arrow>
                Commander
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="#la-carte" variant="outline" size="lg" arrow>
                Voir la carte
              </ButtonLink>
            </Magnetic>
          </div>
          <div className="flex flex-col gap-2 lg:hidden">
            <p className="kicker text-bone/65">
              {restaurant.address.street} — {restaurant.address.postalCode} {restaurant.address.city}
            </p>
            <p className="kicker text-bone/65">Smash burgers · Frenchy’s · Shakes</p>
          </div>
        </div>

        <div className="fade-up mt-8 flex items-center justify-between gap-6 border-t border-bone/15 pt-4 lg:mt-10 lg:w-[40%]" style={{ "--d": "1s" } as React.CSSProperties}>
          <OpeningStatus className="text-bone/80" />
          <span className="flex items-center gap-3 text-bone/55">
            <span className="kicker">Scroll</span>
            <span className="relative block h-8 w-px overflow-hidden bg-bone/15">
              <span className="scroll-cue absolute inset-0 bg-cheddar" />
            </span>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
