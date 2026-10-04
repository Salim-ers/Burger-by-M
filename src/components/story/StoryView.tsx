"use client";

import Image from "next/image";
import Link from "next/link";
import { LineReveal, MaskReveal, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { useSite } from "@/features/site-context";
import { media } from "@/data/media";

/**
 * Notre histoire : uniquement des faits vérifiables (adresse, carte, méthode du smash, lieu).
 * Aucune date de création, aucun fondateur, aucune anecdote inventés.
 */
export function StoryView() {
  const { menu, store } = useSite();
  const count = menu.reduce((n, c) => n + c.products.length, 0);
  return (
    <>
      <section className="on-light bg-ivory pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="shell">
          <p className="kicker text-brass-deep">Notre histoire</p>
          <h1 className="display-1 mt-6">
            <span className="reveal-line" style={{ "--i": 0 } as React.CSSProperties}>
              <span>Une adresse.</span>
            </span>
            <span className="reveal-line" style={{ "--i": 1 } as React.CSSProperties}>
              <span>Une méthode.</span>
            </span>
            <span className="reveal-line text-crust" style={{ "--i": 2 } as React.CSSProperties}>
              <span className="italic">Un M.</span>
            </span>
          </h1>
        </div>
      </section>

      <section aria-labelledby="adresse-title" className="on-light bg-ivory pb-24 md:pb-36">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-center">
          <MaskReveal className="aspect-[4/5] bg-sand md:col-span-5">
            <Image src={media.devanture.src} alt={media.devanture.alt} fill loading="eager" sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: media.devanture.position }} />
          </MaskReveal>
          <div className="md:col-span-6 md:col-start-7">
            <p className="kicker text-brass-deep">01 — L’adresse</p>
            <LineReveal id="adresse-title" lines={[store.street, <span key="c" className="italic">{store.city}.</span>]} className="display-3 mt-5" />
            <p className="mt-8 max-w-lg text-[1.05rem] leading-relaxed text-sub">
              Burger By M, c’est un comptoir et une terrasse au {store.street}, à {store.city}, dans l’Oise. On y mange sur place, on y passe prendre sa commande. La carte se lit d’un coup d’œil ; chaque burger porte la signature de la maison.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="methode-title" className="on-dark bg-ink py-24 md:py-36">
        <div className="shell grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="kicker text-brass">02 — La méthode</p>
            <LineReveal id="methode-title" lines={["Smashed", <span key="o" className="italic">to order.</span>]} className="display-2 mt-6" />
          </div>
          <ol className="space-y-10 md:col-span-6 md:col-start-7">
            {[
              ["La boule", "La viande arrive en boule, jamais pressée à l’avance."],
              ["La plaque", "Elle est écrasée sur la plaque brûlante au moment de la commande : la surface caramélise, le cœur reste juteux."],
              ["Le cheddar", "Il se pose sur la viande encore chaude et fond jusqu’au bord."],
              ["Le pain", "Potatoes bun pour les smash, baguette briochée pour les Frenchy’s."],
            ].map(([title, text], i) => (
              <Reveal as="li" key={title} delay={i * 0.06} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-rule pt-6">
                <span className="font-serif text-3xl text-brass tabular-nums">{i + 1}</span>
                <div>
                  <p className="font-serif text-2xl">{title}</p>
                  <p className="mt-2 leading-relaxed text-fg/65">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="carte-title" className="on-light bg-paper py-24 md:py-36">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <p className="kicker text-brass-deep">03 — La carte</p>
            <LineReveal id="carte-title" lines={[`${count} recettes,`, <span key="i" className="italic">zéro détour.</span>]} className="display-3 mt-5" />
            <ul className="mt-10 flex flex-wrap gap-2">
              {menu.map((c) => (
                <li key={c.id}>
                  <Link href={`/menu#cat-${c.slug}`} className="inline-flex h-10 items-center border border-rule px-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:border-ink">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/menu" variant="ink" size="lg" arrow className="mt-10">
              Voir la carte
            </ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-6">
            <MaskReveal className="aspect-[3/4] bg-sand">
              <Image src={media.realSpecial.src} alt={media.realSpecial.alt} fill sizes="25vw" className="object-cover" style={{ objectPosition: media.realSpecial.position }} />
            </MaskReveal>
            <MaskReveal className="mt-12 aspect-[3/4] bg-sand">
              <Image src={media.milkshakePistache.src} alt={media.milkshakePistache.alt} fill sizes="25vw" className="object-cover" style={{ objectPosition: media.milkshakePistache.position }} />
            </MaskReveal>
          </div>
        </div>
      </section>
    </>
  );
}
