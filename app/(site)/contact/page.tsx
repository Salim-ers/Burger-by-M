import type { Metadata } from "next";
import { ContactForm } from "@/components/restaurant/ContactForm";
import { HoursTable } from "@/components/restaurant/HoursTable";
import { ButtonLink } from "@/components/ui/Button";
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
      <header className="bg-ink pt-32 pb-16 md:pt-44 md:pb-24">
        <div className="container-site">
          <h1 className="font-display text-mega font-medium uppercase">
            On
            <br />
            <span className="text-rose">papote ?</span>
          </h1>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Téléphone</p>
              <a href={restaurant.phone.href} className="mt-3 block font-display text-4xl tabular-nums hover:text-rose">
                {restaurant.phone.display}
              </a>
            </div>
            <address className="not-italic">
              <p className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Adresse</p>
              <p className="mt-3 text-xl leading-snug">
                {restaurant.address.street}
                <br />
                {restaurant.address.postalCode} {restaurant.address.city}
              </p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-rose underline-offset-4 hover:underline">
                Itinéraire
              </a>
            </address>
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Commander</p>
              <ButtonLink href="/commander" variant="rose" arrow className="mt-3">
                Commander en ligne
              </ButtonLink>
            </div>
          </div>
        </div>
      </header>
      <section aria-labelledby="form-title" className="bg-cream py-20 text-ink md:py-32">
        <div className="container-site grid gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 id="form-title" className="font-display text-title uppercase">
              Écris-nous
            </h2>
            <p className="mt-3 mb-10 max-w-md text-ink/70">Une question, un événement, une remarque ? Pour une commande, passe plutôt par la commande en ligne ou le téléphone.</p>
            <div className="relative">
              <ContactForm />
            </div>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <h2 className="font-display text-title uppercase">Horaires</h2>
            <div className="mt-6">
              <HoursTable />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
