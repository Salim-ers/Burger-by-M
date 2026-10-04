"use client";

import Image from "next/image";
import { LineReveal, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { useSite } from "@/features/site-context";
import { useOrderingNotice } from "@/features/store/use-status";
import { media } from "@/data/media";

/** Dernier appel : grande photo réelle, texte en HTML par-dessus. */
export function FinalCta() {
  const { store } = useSite();
  const notice = useOrderingNotice();
  return (
    <section aria-labelledby="final-title" className="on-dark relative isolate overflow-hidden bg-ink">
      <Image src={media.plateau.src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-55" style={{ objectPosition: "50% 40%" }} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(13,13,13,0.2)_0%,rgba(13,13,13,0.55)_55%,#0d0d0d_100%)]" />
      <div className="shell flex min-h-[86svh] flex-col justify-end pt-40 pb-20 md:pb-28">
        <p className="kicker text-brass">Commande en ligne · Retrait au restaurant</p>
        <LineReveal id="final-title" lines={["Le prochain", <span key="v" className="italic">est pour vous.</span>]} className="display-1 mt-6" />
        <Reveal delay={0.2} className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-[1.02rem] leading-relaxed text-fg/75">
            {notice ?? `Choisissez votre heure de retrait : votre commande est préparée pour ce moment-là, au ${store.street}.`}
          </p>
          <div className="flex flex-wrap gap-2">
            {!notice && (
              <ButtonLink href="/menu" variant="ivory" size="xl" arrow>
                Commander
              </ButtonLink>
            )}
            <ButtonLink href={store.phoneHref} variant="line" size="xl">
              {store.phone}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
