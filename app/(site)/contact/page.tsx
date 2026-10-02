import type { Metadata } from "next";
import { ContactForm } from "@/components/restaurant/ContactForm";
import { HoursGrid } from "@/components/restaurant/HoursGrid";
import { ButtonLink } from "@/components/ui/Button";
import { LineReveal } from "@/components/motion/LineReveal";
import { directionsUrl, restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contacter Burger By M à Rantigny : téléphone 03 44 24 89 18, adresse 19 avenue de la Gare, 60290 Rantigny, horaires et formulaire.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <header className="scheme-dark bg-ink pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="shell">
          <LineReveal as="h1" lines={["On", <>t’écoute<span className="text-cheddar">.</span></>]} className="font-display text-d1" />
          <div className="grid-12 mt-14 gap-y-10 border-t border-graphite pt-8">
            <div className="col-span-12 md:col-span-4">
              <p className="kicker text-bone/55">Téléphone</p>
              <a href={restaurant.phone.href} className="mt-3 block font-display text-d4 tabular-nums transition-colors hover:text-cheddar">
                {restaurant.phone.display}
              </a>
            </div>
            <address className="col-span-12 not-italic md:col-span-4">
              <p className="kicker text-bone/55">Adresse</p>
              <p className="mt-3 font-display text-d5">
                {restaurant.address.street}
                <br />
                {restaurant.address.postalCode} {restaurant.address.city}
              </p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-bone/70 underline underline-offset-4 hover:text-cheddar">
                Itinéraire
              </a>
            </address>
            <div className="col-span-12 md:col-span-4">
              <p className="kicker text-bone/55">Commander</p>
              <ButtonLink href="/commander" variant="primary" size="lg" arrow className="mt-3">
                Commander en ligne
              </ButtonLink>
            </div>
          </div>
        </div>
      </header>
      <section aria-labelledby="form-title" className="scheme-light bg-bone py-20 text-ink md:py-28">
        <div className="shell grid-12 gap-y-16">
          <div className="col-span-12 lg:col-span-7">
            <h2 id="form-title" className="font-display text-d3">
              Écris-nous
            </h2>
            <p className="mt-3 mb-10 max-w-md text-ink/65">Une question, un événement, une remarque ? Pour une commande, passe plutôt par la commande en ligne ou le téléphone.</p>
            <div className="relative">
              <ContactForm />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-12">
            <h2 className="kicker mb-4 text-ink/55">Horaires</h2>
            <HoursGrid />
          </div>
        </div>
      </section>
    </>
  );
}
