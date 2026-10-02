"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LineReveal } from "@/components/motion/LineReveal";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { useOrdering } from "@/hooks/use-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { restaurant } from "@/data/restaurant";

/** 10 — CTA COMMANDER. Une phrase, une barre cheddar pleine largeur. */
export function FinalCta() {
  const hydrated = useHydrated();
  const { prepMinutes } = useOrdering();
  return (
    <section aria-labelledby="cta-title" data-hide-order-bar className="scheme-dark bg-ink pt-24 md:pt-36">
      <div className="shell">
        <div className="grid-12 items-end gap-y-10">
          <div className="col-span-12 lg:col-span-8">
            <p className="kicker mb-6 text-bone/55">10 — Commander</p>
            <LineReveal id="cta-title" lines={["Made to", "disappear."]} className="font-display text-d1" />
          </div>
          <dl className="col-span-12 grid grid-cols-2 gap-6 border-t border-bone/20 pt-5 lg:col-span-4">
            <div>
              <dt className="kicker text-bone/55">Prête en</dt>
              <dd className="mt-2 flex items-center gap-1 font-display text-5xl">
                ≈<RollingNumber value={hydrated ? prepMinutes : 20} pad={2} />
                <span className="text-xl">min</span>
              </dd>
            </div>
            <div>
              <dt className="kicker text-bone/55">Retrait</dt>
              <dd className="mt-2 text-sm leading-relaxed text-bone/80">
                {restaurant.address.street}
                <br />
                Paiement au retrait
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <Link
        href="/commander"
        data-cursor="go"
        className="group mt-14 flex items-center justify-between gap-6 bg-cheddar px-[clamp(1rem,3.2vw,3rem)] py-[clamp(1.5rem,4vw,3.5rem)] text-ink transition-colors duration-300 hover:bg-bone md:mt-20"
      >
        <span className="font-display text-[clamp(3.2rem,11vw,11rem)] leading-[0.85] uppercase">Commander</span>
        <ArrowRight className="size-[clamp(2.5rem,8vw,8rem)] shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-1.5" strokeWidth={2.25} aria-hidden />
      </Link>
    </section>
  );
}
