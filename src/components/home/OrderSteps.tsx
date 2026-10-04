"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { useSite } from "@/features/site-context";
import { media, type MediaImage } from "@/data/media";
import { cn } from "@/lib/utils";

type Step = { n: string; title: string; text: string; img: MediaImage; frame: string };

/** De l'envie à la commande : quatre étapes, défilement horizontal sur desktop, glisser sur mobile. */
export function OrderSteps() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { store } = useSite();
  const card = store.paymentMethods.includes("card");
  const onSite = store.paymentMethods.includes("on_site");

  const steps: Step[] = [
    { n: "01", title: "Choisissez.", text: "Smash, classic, Frenchy’s, frites, shakes : toute la carte est en ligne, avec ses prix.", img: media.lineupSmash, frame: "aspect-[16/10]" },
    { n: "02", title: "Personnalisez.", text: "Sans oignons, cheddar en plus, en menu : le prix se met à jour en direct.", img: media.baconCrispy, frame: "aspect-[4/3]" },
    {
      n: "03",
      title: "Payez.",
      text: card
        ? `${store.cardCapture === "manual" ? "Carte bancaire sécurisée par Mollie : le montant est réservé, puis encaissé quand la cuisine accepte votre commande." : "Carte bancaire sécurisée par Mollie, remboursée si la cuisine ne peut pas accepter votre commande."}${onSite ? " Ou réglez au retrait." : ""}`
        : "Réglez au retrait, au comptoir.",
      img: media.fritesCheddarOignons,
      frame: "aspect-[3/2]",
    },
    { n: "04", title: "Récupérez.", text: `À l’heure choisie, présentez votre numéro au comptoir — ${store.street}.`, img: media.devanture, frame: "aspect-[4/5]" },
  ];

  useGSAP(
    () => {
      const el = track.current;
      if (!el || reducedMotion() || !window.matchMedia("(min-width: 1024px)").matches) return;
      const distance = () => el.scrollWidth - window.innerWidth;
      gsap.to(el, { x: () => -distance(), ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-theme="light" aria-labelledby="steps-title" className="on-light relative overflow-hidden bg-ivory py-[var(--space-lg)] lg:flex lg:h-svh lg:items-center lg:py-0">
      {/* Mouvement réduit : pas d'épinglage, la piste reste défilable horizontalement. */}
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--gutter)] lg:snap-none lg:gap-[4vw] lg:overflow-visible lg:pr-[12vw] lg:motion-reduce:snap-x lg:motion-reduce:overflow-x-auto">
        <div className="flex w-[78vw] shrink-0 snap-start flex-col justify-center sm:w-[50vw] lg:w-[30vw]">
          <p className="t-label text-cheddar-deep">Click &amp; collect</p>
          <h2 id="steps-title" className="mt-5">
            <span className="t-xl block">Commander,</span>
            <span className="s-xl block">sans attendre.</span>
          </h2>
          <p className="mt-6 max-w-sm text-sub">Pas de compte à créer. Quatre gestes, et votre commande part en cuisine.</p>
        </div>
        {steps.map((s) => (
          <article key={s.n} className="w-[84vw] shrink-0 snap-start sm:w-[62vw] lg:w-[44vw]">
            <div className={cn("relative w-full overflow-hidden bg-sand", s.frame, "lg:aspect-auto lg:h-[56svh]")}>
              <Image src={s.img.src} alt={s.img.alt} fill sizes="(min-width: 1024px) 44vw, 84vw" className="object-cover" style={s.img.position ? { objectPosition: s.img.position } : undefined} />
              <span className="t-xl absolute top-4 left-5 text-ivory drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">{s.n}</span>
            </div>
            <div className="mt-5 flex flex-col gap-2 border-t border-ink pt-4 md:flex-row md:items-baseline md:justify-between md:gap-8">
              <h3 className="t-l">{s.title}</h3>
              <p className="max-w-sm text-[0.95rem] leading-relaxed text-sub">{s.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
