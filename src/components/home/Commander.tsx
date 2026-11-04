"use client";

import Link from "next/link";
import { useRef } from "react";
import { RevealText } from "@/components/motion";
import { useSite } from "@/features/site-context";
import { useOpeningStatus, useOrderingNotice, ORDERING_CLOSED_LABEL } from "@/features/store/use-status";
import { formatHour } from "@/lib/schedule";
import { cn } from "@/lib/utils";

/**
 * Dernière séquence : une phrase, puis un seul geste, au centre. Le cheddar reste la couleur de l'action.
 * Au survol, le crème part du pointeur.
 */
export function Commander() {
  const { store } = useSite();
  const status = useOpeningStatus();
  const notice = useOrderingNotice();
  const button = useRef<HTMLAnchorElement>(null);

  const place = (e: React.PointerEvent) => {
    const el = button.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const statusText = !status.ready ? " " : status.isOpen ? `Ouvert${status.closesAt ? ` jusqu’à ${formatHour(status.closesAt)}` : ""}` : `Fermé${status.nextOpeningLabel ? `, ouvre ${status.nextOpeningLabel}` : ""}`;

  return (
    <section data-theme="dark" aria-labelledby="commander-title" className="on-dark relative bg-ink pt-[clamp(5rem,14vh,10rem)] pb-[clamp(2.5rem,7vh,5rem)] text-center">
      <div className="container-cine">
        <RevealText id="commander-title" lines={["Vous savez déjà", "ce que vous allez prendre."]} className="t-l text-[8.6vw] text-cream md:text-[clamp(2.6rem,4.6vw,5.5rem)]" />

        <Link
          ref={button}
          href="/menu"
          onPointerEnter={place}
          onPointerMove={place}
          className={cn("final-cta mt-[clamp(2rem,5vh,3.5rem)]", notice && "final-cta-closed")}
        >
          <span className="relative">{notice ? "La carte" : "Commander"}</span>
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="final-cta-arrow relative">
            <path d="M6 24h34M27 10l14 14-14 14" />
          </svg>
        </Link>

        <div className="mt-6 flex flex-col items-center justify-center gap-x-8 gap-y-1 text-[0.95rem] text-cream/65 sm:flex-row" aria-live="polite">
          {notice ? (
            <p>
              {ORDERING_CLOSED_LABEL}.{" "}
              <a href={store.phoneHref} className="font-semibold whitespace-nowrap text-cream underline decoration-cream/30 underline-offset-4">
                {store.phone}
              </a>
            </p>
          ) : (
            <p className="min-h-[1.5em]">{statusText}</p>
          )}
          {store.pickupEnabled && (
            <p>
              Retrait au {store.street}, {store.city}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
