import { RevealText } from "@/components/animations/RevealText";
import { ButtonLink } from "@/components/ui/Button";
import { testimonials } from "@/data/testimonials";
import { restaurant } from "@/data/restaurant";

/**
 * Avis : n'affiche QUE des avis réels publiés (data/testimonials.ts).
 * Sans avis, la section devient une invitation — aucune note ni avis inventés.
 */
export function Reviews() {
  const published = testimonials.filter((t) => t.published).slice(0, 3);

  return (
    <section aria-labelledby="avis-title" className="bg-cream py-28 text-ink md:py-40">
      <div className="container-site grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <RevealText id="avis-title" lines={["Ils ont", "déjà croqué."]} className="font-display text-huge font-medium uppercase" />
        </div>

        {published.length > 0 ? (
          <ul className="space-y-12 md:col-span-6 md:col-start-7">
            {published.map((t) => (
              <li key={t.id} className="border-t border-ink/15 pt-8">
                <blockquote>
                  <p className="font-display text-2xl leading-snug md:text-3xl">« {t.text} »</p>
                  <footer className="mt-4 text-sm text-brown">
                    {t.author} · avis {t.source === "google" ? "Google" : t.source}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
        ) : (
          <div className="md:col-span-6 md:col-start-7">
            <p aria-hidden className="font-display text-[12rem] leading-[0.7] text-rose-deep">“</p>
            <p className="mt-2 font-display text-3xl leading-tight md:text-[2.6rem]">Vos mots auront bientôt leur place ici.</p>
            <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-ink/70">
              Passé·e par l’avenue de la Gare ? Racontez-nous ce que vous avez croqué : nous publierons ici une sélection de vrais avis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {restaurant.googleReviewUrl ? (
                <ButtonLink href={restaurant.googleReviewUrl} variant="ink" arrow>
                  Laisser un avis
                </ButtonLink>
              ) : (
                <ButtonLink href="/contact" variant="ink" arrow>
                  Nous écrire
                </ButtonLink>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
