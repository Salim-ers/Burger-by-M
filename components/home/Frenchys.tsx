"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useReduce } from "@/components/motion/use-reduced";
import { useScrollMap } from "@/components/motion/use-scroll-map";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { LineReveal } from "@/components/motion/LineReveal";
import { RevealImage } from "@/components/motion/RevealImage";
import { useMenuProducts } from "@/hooks/use-menu";
import { rectOf, useUiStore } from "@/stores/ui-store";
import { images } from "@/data/images";
import { useMediaQuery } from "@/hooks/use-media-query";

const hot = images.frenchyHot;
const forestier = images.forestier;

/** 05 — FRENCHY'S. Section horizontale épinglée (desktop) : on scrolle vers le bas, la scène défile vers la gauche. */
export function Frenchys() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReduce();
  return desktop && !reduce ? <FrenchysHorizontal /> : <FrenchysStacked />;
}

function useFrenchys() {
  const products = useMenuProducts();
  return products.filter((p) => p.category === "frenchys");
}

function Claim({ className }: { className?: string }) {
  return (
    <LineReveal
      as="p"
      lines={["Pas un burger.", "Pas un panini.", <span key="u" className="text-cheddar">Un Frenchy.</span>]}
      className={className}
    />
  );
}

function List({ className }: { className?: string }) {
  const items = useFrenchys();
  const openProduct = useUiStore((s) => s.openProduct);
  return (
    <ul className={className}>
      {items.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            data-cursor="add"
            onClick={(e) => openProduct(p.id, undefined, rectOf(e.currentTarget))}
            className="group flex w-full items-baseline justify-between gap-4 border-b border-bone/15 py-3 text-left transition-colors hover:border-cheddar"
          >
            <span className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-cheddar">{p.name}</span>
            <span className="font-display text-xl text-bone/80">
              <Price cents={p.price} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function FrenchysHorizontal() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.35 });
  const x = useScrollMap(p, [0, 1], [0, -distance]);
  const imgShift = useScrollMap(p, [0, 1], ["-6%", "6%"]);
  const titleX = useScrollMap(p, [0, 1], ["0%", "12%"]);

  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section ref={ref} aria-labelledby="frenchys-title" className="scheme-dark relative bg-graphite" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div ref={trackRef} className="flex h-full w-max items-center gap-[4vw] pr-[6vw] pl-[3vw] will-change-transform" style={{ x }}>
          {/* 1 — Titre vertical */}
          <div className="relative flex h-[84vh] w-[24vw] shrink-0 items-end">
            <p className="kicker absolute top-0 left-0 text-bone/55">05 — Les Frenchy’s</p>
            <h2 id="frenchys-title" className="absolute bottom-0 left-0 origin-bottom-left translate-x-[0.8em] -rotate-90 font-display text-[min(18vh,13vw)] leading-[0.8] whitespace-nowrap text-bone">
              <motion.span className="block" style={{ x: titleX }}>
                Frenchy’s
              </motion.span>
            </h2>
            <p className="absolute right-0 bottom-0 max-w-[10rem] text-right text-sm leading-relaxed text-bone/60">Servi dans une baguette briochée.</p>
          </div>

          {/* 2 — Le Hot, presque plein cadre, texte superposé */}
          <div className="relative h-[84vh] w-[56vw] shrink-0">
            <div className="absolute inset-0 overflow-hidden" data-cursor="view">
              <motion.div className="absolute -inset-x-[8%] inset-y-0" style={{ x: imgShift }}>
                <Image src={hot.src} alt={hot.alt} fill sizes="62vw" quality={90} className="object-cover" style={{ objectPosition: hot.position }} />
              </motion.div>
              <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/15 to-transparent" />
            </div>
            <Claim className="absolute bottom-[8%] -left-[3vw] font-display text-[clamp(3rem,6.4vw,7rem)] leading-[0.86] text-bone" />
            <p className="kicker absolute top-5 right-5 bg-ink/70 px-2 py-1 text-bone/85">Le Hot — 9,90 €</p>
          </div>

          {/* 3 — Le Forestier, horizontal, décalé */}
          <div className="flex h-[84vh] w-[40vw] shrink-0 flex-col justify-between">
            <p className="max-w-sm font-display text-[clamp(2rem,3.2vw,3.4rem)] leading-[1] text-bone/90">Baguette briochée. Garniture jusqu’au bout.</p>
            <figure>
              <div className="relative aspect-[720/385] overflow-hidden" data-cursor="view">
                <Image src={forestier.src} alt={forestier.alt} fill sizes="40vw" quality={90} className="object-cover" style={{ objectPosition: forestier.position }} />
              </div>
              <figcaption className="kicker mt-3 flex justify-between text-bone/55">
                <span>Le Forestier</span>
                <span>Poulet crunch · crème champignons</span>
              </figcaption>
            </figure>
          </div>

          {/* 4 — La liste + CTA */}
          <div className="flex h-[84vh] w-[32vw] shrink-0 flex-col justify-center">
            <p className="kicker mb-4 text-bone/55">La gamme</p>
            <List />
            <ButtonLink href="/menu#frenchys" variant="primary" size="lg" arrow className="mt-10 self-start">
              Voir les Frenchy’s
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FrenchysStacked() {
  return (
    <section aria-labelledby="frenchys-title-m" className="scheme-dark overflow-hidden bg-graphite py-20">
      <div className="shell">
        <p className="kicker text-bone/55">05 — Les Frenchy’s</p>
        <h2 id="frenchys-title-m" className="mt-4 font-display text-[clamp(4.5rem,24vw,12rem)] leading-[0.8]">
          Frenchy’s
        </h2>
        <p className="mt-3 text-sm text-bone/60">Servi dans une baguette briochée.</p>
      </div>
      <div className="relative mt-10">
        <RevealImage image={hot} sizes="100vw" className="aspect-[4/5] w-full" from="right" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <Claim className="shell absolute inset-x-0 bottom-6 font-display text-[clamp(2.6rem,12vw,5rem)] leading-[0.86] text-bone" />
      </div>
      <div className="shell mt-10">
        <RevealImage image={forestier} sizes="100vw" className="aspect-[720/385] w-full" from="left" />
        <p className="kicker mt-3 text-bone/55">Le Forestier — poulet crunch, crème champignons</p>
        <List className="mt-10" />
        <ButtonLink href="/menu#frenchys" variant="primary" size="lg" arrow className="mt-8">
          Voir les Frenchy’s
        </ButtonLink>
      </div>
    </section>
  );
}
