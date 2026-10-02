"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { images } from "@/data/images";
import { restaurant } from "@/data/restaurant";

const WORDS = ["Smash.", "Crunch.", "Repeat."];

export function Hero() {
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const { innerWidth: w, innerHeight: h } = window;
    mx.set((e.clientX / w - 0.5) * -18);
    my.set((e.clientY / h - 0.5) * -12);
  };

  return (
    <section onPointerMove={onMove} aria-labelledby="hero-title" className="relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      {/* Burger : la star. Plein cadre sur mobile, grand panneau vertical sur desktop (photo source 720 px). */}
      <motion.div style={{ x: mx, y: my }} className="absolute -inset-x-3 -top-3 h-[60svh] overflow-hidden md:inset-y-[-1rem] md:right-[-1rem] md:left-auto md:h-auto md:w-[min(64vw,1000px)]">
        <div className="kenburns absolute inset-0">
          <Image
            src={images.smashSpecial.src}
            alt={images.smashSpecial.alt}
            fill
            priority
            quality={90}
            sizes="(min-width: 768px) 64vw, 100vw"
            className="object-cover object-[50%_62%] md:object-[50%_50%]"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10 md:bg-gradient-to-r md:from-ink md:via-ink/5 md:to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      </motion.div>

      <div className="container-site relative z-10 flex h-full flex-col justify-end pt-28 pb-20 md:justify-center md:pb-10">
        <div className="hero-fade mb-6 md:mb-8" style={{ ["--d" as string]: "80ms" }}>
          <OpeningStatus className="text-cream/85" />
        </div>

        <h1 id="hero-title" className="font-display text-[clamp(3.3rem,16.5vw,6.6rem)] md:text-[clamp(5rem,11.5vw,10.6rem)] leading-[0.84] font-medium tracking-[-0.035em] uppercase">
          <span className="sr-only">Burger By M, smash burgers à Rantigny. </span>
          {WORDS.map((w, i) => (
            <span key={w} className="hero-line" style={{ ["--i" as string]: i }} aria-hidden>
              <span className={i === 2 ? "text-rose" : undefined}>{w}</span>
            </span>
          ))}
        </h1>

        <p className="hero-fade mt-7 max-w-sm text-[1.05rem] leading-relaxed text-cream/80 md:mt-9 md:text-lg" style={{ ["--d" as string]: "520ms" }}>
          Des burgers généreux.
          <br />
          Des sauces maison.
          <br />À Rantigny.
        </p>

        <div className="hero-fade mt-8 flex flex-wrap items-center gap-3 md:mt-10" style={{ ["--d" as string]: "640ms" }}>
          <MagneticButton>
            <ButtonLink href="/commander" variant="rose" size="lg" arrow data-cursor="Go">
              Commander maintenant
            </ButtonLink>
          </MagneticButton>
          <ButtonLink href="/menu" variant="outline-light" size="lg">
            Voir la carte
          </ButtonLink>
        </div>
      </div>

      <div className="hero-fade absolute inset-x-0 bottom-0 z-10" style={{ ["--d" as string]: "900ms" }}>
        <div className="container-site flex items-end justify-between pb-6 text-[0.78rem] text-cream/65">
          <p>
            {restaurant.address.street.replace("Avenue", "avenue")} <span className="text-rose">·</span> {restaurant.address.city}
          </p>
          <a href="#signature" className="hidden items-center gap-3 tracking-[0.18em] uppercase hover:text-cream md:flex">
            <span className="relative block h-10 w-px overflow-hidden bg-cream/15">
              <span className="scroll-cue absolute inset-0 bg-rose" />
            </span>
            Scroll to taste
          </a>
        </div>
      </div>
    </section>
  );
}
