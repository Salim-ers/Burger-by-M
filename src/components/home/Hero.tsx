"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { Magnetic, useReduce, useScrollMap } from "@/components/motion";
import { useSite } from "@/features/site-context";
import { useOpeningStatus } from "@/features/store/use-status";

const BURGER = { src: "/images/cutouts/smash-double.webp", width: 1144, height: 764, alt: "Smash Double Burger By M : double steak smash, cheddar fondu, salade et sauce smash" };

/**
 * Hero : couverture de magazine. Le titre XXL est derrière, le vrai burger (détouré) passe devant.
 * Profondeur au défilement et légère attraction vers le curseur.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReduce();
  const { store } = useSite();
  const status = useOpeningStatus();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useScrollMap(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const burgerY = useScrollMap(scrollYProgress, [0, 1], ["0%", "12%"]);
  const burgerScale = useScrollMap(scrollYProgress, [0, 1], [1, 1.08]);
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="on-light relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[radial-gradient(120%_80%_at_50%_42%,#f1e9dc_0%,#e9e0d1_55%,#e0d4c1_100%)] pt-24 md:pt-28"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        mx.set((e.clientX / window.innerWidth - 0.5) * 18);
        my.set((e.clientY / window.innerHeight - 0.5) * 12);
      }}
    >
      <div className="shell flex items-center justify-between">
        <p className="kicker soft-in text-ink/60" style={{ "--d": "0.2s" } as React.CSSProperties}>
          Smashed to order
        </p>
        <p className="kicker soft-in hidden text-ink/60 sm:block" style={{ "--d": "0.3s" } as React.CSSProperties}>
          Rantigny — Oise
        </p>
      </div>

      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center md:mt-0">
        <motion.h1 id="hero-title" style={reduce ? undefined : { y: titleY }} className="relative z-0 text-center font-serif leading-[0.8] tracking-[-0.045em] text-ink">
          <span className="reveal-line text-[25vw] md:hidden" style={{ "--i": 0 } as React.CSSProperties}>
            <span>Burger</span>
          </span>
          <span className="reveal-line text-[25vw] md:hidden" style={{ "--i": 1 } as React.CSSProperties}>
            <span>
              <span className="italic">by</span> M
            </span>
          </span>
          <span className="reveal-line hidden text-[13.2vw] md:block" style={{ "--i": 0 } as React.CSSProperties}>
            <span>
              Burger <span className="italic">by</span> M
            </span>
          </span>
        </motion.h1>

        <motion.div style={reduce ? undefined : { y: burgerY, scale: burgerScale }} className="relative z-10 -mt-[2vw] w-[94vw] max-w-[820px] md:-mt-[4.6vw] md:w-[50vw]">
          <motion.div style={reduce ? undefined : { x: mx, y: my }} className="lift-in">
            <Image src={BURGER.src} alt={BURGER.alt} width={BURGER.width} height={BURGER.height} preload sizes="(min-width: 768px) 50vw, 94vw" className="h-auto w-full drop-shadow-[0_40px_40px_rgba(60,35,20,0.28)]" />
          </motion.div>
        </motion.div>
      </div>

      <div className="shell relative z-20 grid gap-8 pt-6 pb-28 md:grid-cols-12 md:items-end md:pb-12">
        <div className="soft-in md:col-span-6" style={{ "--d": "0.7s" } as React.CSSProperties}>
          <p className="font-serif text-[2rem] leading-[1.02] md:text-[2.6rem]">
            Brut. Généreux. <span className="text-crust italic">Signé M.</span>
          </p>
          <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink/70">Smash burgers, créations généreuses et recettes maison à Rantigny.</p>
        </div>
        <div className="soft-in flex flex-col gap-4 md:col-span-6 md:items-end" style={{ "--d": "0.85s" } as React.CSSProperties}>
          <div className="flex flex-wrap gap-2">
            <Magnetic>
              <Link href="/menu" className={buttonClasses("ink", "lg")}>
                Commander
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/menu" className={buttonClasses("line", "lg")}>
                Voir la carte
              </Link>
            </Magnetic>
          </div>
          <p className="kicker text-ink/60">
            {store.street} — {store.city} · Sur place · À emporter
            {status.ready && <span className={status.isOpen ? "text-open" : "text-closed"}> · {status.isOpen ? "Ouvert" : "Fermé"}</span>}
          </p>
        </div>
      </div>
      <a href="#construction" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-ink/50 transition-colors hover:text-ink md:block" aria-label="Découvrir">
        <ArrowDown className="size-5 animate-bounce" strokeWidth={1.25} />
      </a>
    </section>
  );
}
