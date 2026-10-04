"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion";
import { useSite } from "@/features/site-context";
import { useOpeningStatus, useOrderingNotice, ORDERING_CLOSED_LABEL } from "@/features/store/use-status";
import { cutout } from "@/data/media";
import { formatHour } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const BURGER = cutout("smash-double", "dark")!;

/**
 * HERO — le produit est le héros. Le vrai Smash Double, monumental, se pose sur SMASHED. MELTED. ;
 * au défilement la scène reste un instant, le burger avance (≤ 1,06), les mots s'écartent, l'image se referme.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { store } = useSite();
  const status = useOpeningStatus();
  const notice = useOrderingNotice();

  useGSAP(
    () => {
      if (reducedMotion() || !root.current) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 } });
      tl.to("[data-burger]", { scale: 1.06, yPercent: 3, ease: "none" }, 0)
        .to("[data-word='smashed']", { xPercent: -10, ease: "none" }, 0)
        .to("[data-word='melted']", { xPercent: 10, ease: "none" }, 0)
        .to("[data-hero-copy]", { autoAlpha: 0, y: -40, ease: "none" }, 0)
        .to("[data-stage]", { clipPath: "inset(8% 4% 8% 4% round 6px)", ease: "none" }, 0.3);
    },
    { scope: root },
  );

  const ctaLabel = notice ? ORDERING_CLOSED_LABEL : "Commander";
  const statusText = status.ready ? (status.isOpen ? `Ouvert${status.closesAt ? ` · jusqu’à ${formatHour(status.closesAt)}` : ""}` : `Fermé${status.nextOpeningLabel ? ` · ouvre ${status.nextOpeningLabel}` : ""}`) : " ";

  return (
    <section ref={root} data-theme="dark" aria-labelledby="hero-title" className="on-dark relative h-[150svh] bg-ink motion-reduce:h-svh" data-intro-delay>
      <div data-stage className="sticky top-0 h-svh overflow-hidden" style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}>
        {/* Lumière chaude de studio derrière le burger, très discrète */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_64%,rgba(91,51,34,0.6)_0%,rgba(91,51,34,0.16)_56%,transparent_80%)]" />

        <div className="container-bm relative flex h-full flex-col pt-24 pb-6 md:pt-28 md:pb-9">
          <div className="hero-fade flex items-center justify-between" style={{ "--d": "0.1s" } as React.CSSProperties}>
            <p className="t-label text-cream/70">Rantigny · Burger by M</p>
            <p className="t-label hidden border border-dashed border-cream/25 px-3 py-1.5 text-cream/55 md:block">Smashed to order · Retrait sur place</p>
          </div>

          <h1 id="hero-title" className="relative z-0 mt-4 md:mt-5">
            <span className="sr-only">Burger By M, smash burgers à Rantigny — </span>
            <span className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span data-word="smashed" className="mask-line hero-line t-xxl block md:text-[12.6vw]" style={{ "--i": 0 } as React.CSSProperties}>
                <span>Smashed.</span>
              </span>
              <span data-word="melted" className="mask-line hero-line t-xxl -mt-[0.18em] block text-right md:-mt-[0.14em] md:text-[12.6vw]" style={{ "--i": 1 } as React.CSSProperties}>
                <span>Melted.</span>
              </span>
            </span>
          </h1>

          {/* Le burger se pose sur les mots (premier plan) */}
          <div className="pointer-events-none relative z-10 -mt-[3vw] flex justify-center md:-mt-[5.2vw]">
            <div data-burger className="w-[min(100vw,46svh)] max-w-none shrink-0 md:w-[min(54vw,104svh)]">
              <div className="hero-photo">
                <Image src={BURGER.src} alt="Smash Double Burger By M : double steak smash, cheddar fondu, salade et sauce smash" width={BURGER.width} height={BURGER.height} preload fetchPriority="high" sizes="(min-width: 768px) 54vw, 104vw" className="h-auto w-full drop-shadow-[0_45px_40px_rgba(0,0,0,0.65)]" />
              </div>
              <div aria-hidden className="mx-auto -mt-[5%] h-10 w-[64%] rounded-[50%] bg-black/80 blur-2xl md:h-16" />
            </div>
          </div>

          <div data-hero-copy className="relative z-20 mt-auto grid gap-5 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <p className="mask-line hero-line" style={{ "--i": 3 } as React.CSSProperties}>
                <span className="s-l text-cream">
                  signed <span className="font-display not-italic text-pink">M.</span>
                </span>
              </p>
              <p className="hero-fade mt-3 max-w-sm text-[0.98rem] leading-relaxed text-cream/75" style={{ "--d": "0.55s" } as React.CSSProperties}>
                Smash burgers, Frenchy’s et créations généreuses préparées à la commande.
              </p>
            </div>
            <div className="hero-fade flex flex-col gap-4 md:col-span-7 md:items-end" style={{ "--d": "0.7s" } as React.CSSProperties}>
              <div className="flex flex-wrap gap-2 max-md:order-2">
                <Magnetic>
                  <Link href="/menu" className={cn("t-label inline-flex h-12 items-center px-5 transition-colors duration-300 md:h-14 md:px-8", notice ? "border border-cream/30 text-cream/70" : "bg-cream text-ink hover:bg-cheddar")}>
                    {ctaLabel}
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link href="/menu" className="t-label inline-flex h-12 items-center border border-cream/30 px-5 text-cream transition-colors hover:border-cream md:h-14 md:px-8">
                    <span className="md:hidden">La carte</span>
                    <span className="hidden md:inline">Découvrir la carte</span>
                  </Link>
                </Magnetic>
              </div>
              <p className="t-label flex flex-wrap items-center gap-x-4 gap-y-1 text-cream/70 max-md:order-1" aria-live="polite">
                <span className="inline-flex items-center gap-2">
                  {status.ready && <span aria-hidden className={cn("size-1.5 rounded-full", status.isOpen ? "bg-open" : "bg-closed")} />}
                  {statusText}
                </span>
                {store.prepMinutes !== null && !notice && <span>≈ {store.prepMinutes} min</span>}
                {store.pickupEnabled && <span>Retrait sur place</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
