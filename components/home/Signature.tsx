"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { images } from "@/data/images";

const FACTS = [
  { title: "Potatoes bun frais", text: "Pour toute la gamme Smash." },
  { title: "Steak façon bouchère 150 g", text: "Au cœur de chaque Classic." },
  { title: "Oignons confits maison", text: "Et plusieurs sauces aussi." },
];

/** Grande phrase typographique traversée par une photo qui s'élargit au scroll. */
export function Signature() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const width = useTransform(scrollYProgress, [0, 1], ["1.1em", "2.7em"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 0]);

  return (
    <section id="signature" ref={ref} aria-labelledby="signature-title" className="relative overflow-hidden bg-ivory py-28 text-ink md:py-44">
      <div className="container-site">
        <h2 id="signature-title" className="font-display text-[clamp(2.4rem,9vw,8.6rem)] leading-[0.86] font-medium tracking-[-0.035em] uppercase">
          <span className="flex items-center gap-[0.18em]">
            <span>Pas</span>
            <motion.span
              aria-hidden
              style={reduce ? { width: "2.4em" } : { width, rotate }}
              className="relative inline-block h-[0.8em] shrink-0 overflow-hidden rounded-full"
            >
              <Image src={images.spicyChicken.src} alt="" fill sizes="(min-width: 768px) 360px, 140px" className="object-cover object-[50%_42%]" />
            </motion.span>
            <span>besoin</span>
          </span>
          <span className="block">de couverts.</span>
        </h2>

        <div className="mt-16 grid gap-10 border-t border-ink/15 pt-10 md:mt-24 md:grid-cols-3 md:gap-12">
          {FACTS.map((f) => (
            <div key={f.title}>
              <p className="font-display text-2xl leading-tight md:text-[1.9rem]">{f.title}</p>
              <p className="mt-2 text-[0.95rem] text-brown">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
