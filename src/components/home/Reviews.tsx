"use client";

import Image from "next/image";
import { LineReveal, MaskReveal, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { useSite } from "@/features/site-context";
import { mapsLinks } from "@/data/brand";
import { media } from "@/data/media";

/**
 * Avis : aucun avis recopié ni inventé sur le site. On renvoie vers la fiche Google,
 * où les avis sont publiés et vérifiables (lien configurable dans /admin/settings).
 */
export function Reviews() {
  const { store } = useSite();
  const url = store.googleReviewsUrl ?? mapsLinks(`${store.street}, ${store.postalCode} ${store.city}`).search;
  return (
    <section aria-labelledby="reviews-title" className="on-light relative overflow-hidden bg-ivory py-24 md:py-36">
      <div className="shell grid items-center gap-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <span aria-hidden className="block font-serif text-[9rem] leading-[0.6] text-brass/70 md:text-[13rem]">
            “
          </span>
          <p className="kicker mt-4 text-brass-deep">Avis</p>
          <LineReveal id="reviews-title" lines={["Les avis de", <span key="c" className="italic">nos clients.</span>]} className="display-2 mt-5" />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-lg text-[1.05rem] leading-relaxed text-sub">Ce sont eux qui en parlent le mieux. Lisez leurs avis, ou laissez le vôtre après votre passage, directement sur Google.</p>
            <ButtonLink href={url} variant="ink" size="lg" arrow className="mt-10">
              Voir les avis Google
            </ButtonLink>
          </Reveal>
        </div>
        <div className="md:col-span-5">
          <MaskReveal className="aspect-[3/4] w-full bg-sand">
            <Image src={media.realSpicyChicken.src} alt={media.realSpicyChicken.alt} fill sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" style={{ objectPosition: media.realSpicyChicken.position }} />
          </MaskReveal>
        </div>
      </div>
    </section>
  );
}
