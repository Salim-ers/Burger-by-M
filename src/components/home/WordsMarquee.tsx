"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/components/motion/gsap";
import { cn } from "@/lib/utils";

const ROW: { w: string; serif?: boolean }[] = [{ w: "Smashed" }, { w: "crispy", serif: true }, { w: "Melted" }, { w: "generous", serif: true }, { w: "By M" }];

/** Transition noire : les mots défilent horizontalement, doucement, au rythme du défilement. */
export function WordsMarquee() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo("[data-row='a']", { xPercent: 0 }, { xPercent: -28, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      gsap.fromTo("[data-row='b']", { xPercent: -28 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    },
    { scope: root },
  );
  const line = (key: string) => (
    <div data-row={key} className="flex w-max items-center whitespace-nowrap">
      {[...ROW, ...ROW, ...ROW].map((r, i) => (
        <span key={i} className="flex items-center">
          <span className={cn("px-6 md:px-10", r.serif ? "s-xxl text-cream/90" : "t-xxl text-cream")}>{r.w}</span>
          <span aria-hidden className="size-3 shrink-0 rounded-full bg-cheddar md:size-4" />
        </span>
      ))}
    </div>
  );
  return (
    <section ref={root} data-theme="dark" aria-label="Smashed, crispy, melted, generous, by M" className="on-dark overflow-hidden bg-ink py-16 md:py-24">
      <div aria-hidden className="space-y-2 md:space-y-4">
        {line("a")}
        {line("b")}
      </div>
    </section>
  );
}
