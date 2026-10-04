"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { cutout } from "@/data/media";
import { cn } from "@/lib/utils";

const SRC = cutout("le-special", "dark")!;

/**
 * Le VRAI Spécial, découpé en bandes horizontales de la même photo (aucun faux burger 3D).
 * Bandes en % de la hauteur du visuel, du bas vers le haut — fidèles à ce que montre la photo :
 * le « deuxième steak » n'étant pas distinct à l'image, il n'est pas annoncé.
 */
type Fx = "drip" | "stagger" | "mask" | "close" | "plain";
const PHASES: { name: string; detail: string; top: number; bottom: number; fx: Fx }[] = [
  { name: "Le pain", detail: "Potatoes bun frais, doré", top: 86, bottom: 100, fx: "plain" },
  { name: "La sauce", detail: "Sauce smash et salade croquante", top: 75, bottom: 86, fx: "mask" },
  { name: "Le steak smash", detail: "Écrasé sur la plaque brûlante, saisi, croustillant", top: 64, bottom: 75, fx: "plain" },
  { name: "Le cheddar", detail: "Il fond sur la viande encore chaude", top: 56, bottom: 64, fx: "drip" },
  { name: "Les toppings", detail: "Cornichons croquants", top: 47, bottom: 56, fx: "plain" },
  { name: "Le crispy", detail: "Oignons crispy, généreusement", top: 35, bottom: 47, fx: "stagger" },
  { name: "Le pain du dessus", detail: "Un trait de sauce smash, on referme", top: 0, bottom: 35, fx: "close" },
];
const N = PHASES.length;
const START = 0.08;
const SPAN = 0.105;
const pad = (n: number) => String(n).padStart(2, "0");
/** Les bandes se chevauchent légèrement (OVERLAP %) : aucune ligne de raccord visible entre deux couches. */
const OVERLAP = 0.4;
const clip = (top: number, bottom: number, side = 0) => `inset(${Math.max(0, top - OVERLAP)}% ${side}% ${Math.max(0, 100 - bottom - OVERLAP)}% ${side}%)`;

export function BurgerBuild() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(-1);
  const [stat, setStat] = useState(false);

  useGSAP(
    () => {
      if (!root.current) return;
      if (reducedMotion()) {
        setStat(true);
        return;
      }
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const drop = mobile ? -38 : -62; // vh
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          onUpdate: (st) => {
            const p = st.progress;
            const next = p < START ? -1 : Math.min(N - 1, Math.floor((p - START) / SPAN));
            setPhase((cur) => (cur === next ? cur : next));
          },
        },
      });

      tl.to("[data-build-intro]", { autoAlpha: 0, yPercent: -40, duration: START, ease: "none" }, 0);
      PHASES.forEach((ph, i) => {
        const at = START + i * SPAN;
        const sel = `[data-layer='${i}']`;
        if (ph.fx === "stagger") {
          tl.fromTo(`${sel} [data-slice]`, { yPercent: drop * 1.6, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: SPAN * 0.8, stagger: SPAN * 0.08 }, at);
        } else {
          tl.fromTo(sel, { y: `${drop}vh`, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: SPAN * 0.85 }, at);
        }
        if (ph.fx === "mask") tl.fromTo(`${sel} [data-img]`, { clipPath: clip(ph.top, ph.bottom, 50) }, { clipPath: clip(ph.top, ph.bottom, 0), duration: SPAN * 0.8, ease: "power2.inOut" }, at + SPAN * 0.1);
        if (ph.fx === "drip") tl.fromTo(sel, { scaleY: 1.07 }, { scaleY: 1, transformOrigin: "50% 0%", duration: SPAN * 0.5, ease: "elastic.out(1, 0.6)" }, at + SPAN * 0.7);
        if (ph.fx === "close") tl.fromTo("[data-stack]", { scaleY: 0.985 }, { scaleY: 1, transformOrigin: "50% 100%", duration: SPAN * 0.4, ease: "back.out(2)" }, at + SPAN * 0.8);
      });
      tl.fromTo("[data-shadow]", { scaleX: 0.35, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: START + SPAN * 2, ease: "none" }, START)
        .fromTo("[data-progress]", { scaleY: 0 }, { scaleY: 1, duration: SPAN * N, ease: "none" }, START)
        // Fin : le burger remonte légèrement pour laisser la place à la phrase de conclusion.
        .to("[data-stage]", { y: "-4vh", scale: mobile ? 0.94 : 0.8, duration: 0.08, ease: "power2.inOut" }, START + SPAN * N)
        .to("[data-phase-text]", { autoAlpha: 0, duration: 0.05, ease: "none" }, START + SPAN * N)
        .fromTo("[data-build-outro]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.08 }, START + SPAN * N + 0.02)
        .to({}, { duration: 0.06 });
    },
    { scope: root },
  );

  if (stat) return <StaticBuild />;
  const current = phase >= 0 ? PHASES[phase]! : null;

  return (
    <section ref={root} data-theme="dark" id="construction" aria-labelledby="build-title" className="on-dark relative h-[230vh] bg-ink md:h-[400vh]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="container-bm relative grid h-full grid-cols-12 items-center gap-4 pt-20 pb-10">
          {/* Indicateur 01 / 07 */}
          <div className="col-span-12 flex items-center gap-4 self-start pt-6 md:col-span-2 md:flex-col md:items-start md:self-center md:pt-0">
            <p className="t-label tabular-nums text-cream/70" aria-hidden>
              {pad(Math.max(1, phase + 1))} / {pad(N)}
            </p>
            <div className="relative h-px w-24 bg-white/12 md:h-[34vh] md:w-px">
              <div data-progress className="absolute inset-0 origin-left bg-cheddar md:origin-top" />
            </div>
          </div>

          {/* Scène */}
          <div className="relative col-span-12 md:col-span-7">
            <div data-build-intro className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center">
              <h2 id="build-title" className="t-xl">
                Un burger
                <br />
                <span className="s-xl normal-case">ça se construit.</span>
              </h2>
            </div>
            <div data-stage className="relative mx-auto w-[min(92vw,640px)]" style={{ aspectRatio: `${SRC.width} / ${SRC.height}` }}>
              <div data-stack className="absolute inset-0">
                {PHASES.map((ph, i) => (
                  <div key={ph.name} data-layer={i} className="absolute inset-0" style={{ zIndex: N - i, visibility: ph.fx === "stagger" ? undefined : "hidden" }}>
                    {ph.fx === "stagger" ? (
                      [0, 1, 2].map((s) => (
                        <div key={s} data-slice className="absolute inset-0" style={{ visibility: "hidden", clipPath: `inset(${ph.top - OVERLAP}% ${Math.max(0, (2 - s) * 33.34 - OVERLAP)}% ${100 - ph.bottom - OVERLAP}% ${Math.max(0, s * 33.33 - OVERLAP)}%)` }}>
                          <Image src={SRC.src} alt="" fill sizes="(min-width: 768px) 640px, 92vw" className="object-contain" />
                        </div>
                      ))
                    ) : (
                      <div data-img className="absolute inset-0" style={{ clipPath: clip(ph.top, ph.bottom) }}>
                        <Image src={SRC.src} alt="" fill sizes="(min-width: 768px) 640px, 92vw" className="object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div data-shadow aria-hidden className="absolute -bottom-[7%] left-[12%] h-[12%] w-[76%] rounded-[50%] bg-black blur-2xl" style={{ visibility: "hidden" }} />
            </div>
            <p className="sr-only">Le Spécial, couche par couche : {PHASES.map((p) => p.name.toLowerCase()).join(", ")}.</p>
          </div>

          {/* Phase en cours */}
          <div data-phase-text className="col-span-12 min-h-28 self-end md:col-span-3 md:self-center" aria-live="polite">
            {current && (
              <div key={phase} className="animate-[soft-in_0.6s_var(--ease-food)_both]">
                <p className="t-label text-cheddar">Phase {pad(phase + 1)}</p>
                <p className="t-l mt-2">{current.name}</p>
                <p className="mt-3 max-w-[16rem] text-[0.95rem] leading-relaxed text-cream/70">{current.detail}</p>
              </div>
            )}
          </div>
        </div>

        <div data-build-outro className="absolute inset-x-0 bottom-10 z-30 text-center md:bottom-14" style={{ visibility: "hidden" }}>
          <p className="t-l">
            Tout est dans <span className="s-l normal-case text-pink">les détails.</span>
          </p>
          <Link href="/menu" className="t-label mt-6 inline-flex h-12 items-center border-b border-cheddar px-1 text-cream transition-colors hover:text-cheddar">
            Voir la carte →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Mouvement réduit : le burger complet et ses couches, sans défilement narratif. */
function StaticBuild() {
  return (
    <section data-theme="dark" id="construction" aria-labelledby="build-title" className="on-dark bg-ink py-24 md:py-36">
      <div className="container-bm grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 id="build-title" className="t-xl">
            Un burger <span className="s-xl normal-case">ça se construit.</span>
          </h2>
          <ol className="mt-10 space-y-3">
            {PHASES.map((p, i) => (
              <li key={p.name} className="flex gap-4 border-t border-rule pt-3">
                <span className="t-label w-8 text-cheddar tabular-nums">{pad(i + 1)}</span>
                <span>
                  <span className="t-s block">{p.name}</span>
                  <span className="text-sm text-cream/70">{p.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="md:col-span-7">
          <Image src={SRC.src} alt="Le Spécial Burger By M : double steak smash, extra cheddar, oignons crispy, cornichons, salade et sauce smash" width={SRC.width} height={SRC.height} sizes="(min-width: 768px) 55vw, 100vw" className="h-auto w-full" />
          <p className="t-l mt-10">
            Tout est dans <span className="s-l normal-case text-pink">les détails.</span>
          </p>
          <Link href="/menu" className="t-label mt-6 inline-flex h-12 items-center border-b border-cheddar text-cream">
            Voir la carte →
          </Link>
        </div>
      </div>
    </section>
  );
}
