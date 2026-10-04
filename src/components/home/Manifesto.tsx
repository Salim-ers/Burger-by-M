"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { RevealImage, RevealText } from "@/components/motion";
import { media } from "@/data/media";

const WORDS = ["Smash", "Cheddar", "Crispy", "Sauce"];

/** Manifeste : beaucoup d'espace, quatre mots qui s'imposent au défilement, un gros plan réel. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-word]").forEach((el) => {
        gsap.fromTo(el, { opacity: 0.1, xPercent: 7 }, { opacity: 1, xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 88%", end: "top 48%", scrub: 0.5 } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="light" aria-labelledby="manifeste-title" className="on-cream relative bg-cream py-[var(--space-xl)]">
      <div className="container-bm grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="t-label text-cheddar-deep">Burger by M</p>
          <RevealText
            id="manifeste-title"
            as="h2"
            className="mt-6"
            lines={[
              <span key="a" className="s-xl">
                La gourmandise
              </span>,
              <span key="b" className="t-xl">
                n’a jamais été
              </span>,
              <span key="c" className="t-xl">
                un détail.
              </span>,
            ]}
          />
          <p className="mt-10 max-w-md text-[1.02rem] leading-relaxed text-sub">
            Le steak est smashé à la commande, le cheddar fond sur la viande encore chaude, le crispy reste croquant. C’est simple, et c’est là que tout se joue.
          </p>
          <ul aria-label="Ce qui fait un Burger By M" className="mt-16 space-y-1 md:mt-24">
            {WORDS.map((w, i) => (
              <li key={w} data-word className="flex items-baseline gap-5">
                <span className="t-label w-8 text-cheddar-deep tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className={i % 2 ? "s-xxl" : "t-xxl"}>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <RevealImage className="aspect-[3/4] w-full bg-ink" panel="var(--cream)" parallax={5}>
              <Image src={media.realSpecial.src} alt={media.realSpecial.alt} fill sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" style={{ objectPosition: media.realSpecial.position }} />
            </RevealImage>
            <p className="t-label mt-4 flex justify-between text-sub">
              <span>Le Spécial, au restaurant</span>
              <span>Photo réelle</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
