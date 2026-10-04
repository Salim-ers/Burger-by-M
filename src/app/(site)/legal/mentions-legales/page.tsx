import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getPublicStore } from "@/features/public-data";
import { brand } from "@/data/brand";
import { legal } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Mentions légales", description: "Mentions légales du site Burger By M, Rantigny : éditeur, hébergement, propriété intellectuelle.", path: "/legal/mentions-legales" });

export default async function MentionsLegalesPage() {
  const store = await getPublicStore();
  const company = [brand.legal.companyName, brand.legal.legalForm, legal.capital].filter(Boolean).join(", ");
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        <strong>{company}</strong>
        <br />
        Siège : {store.street}, {store.postalCode} {store.city}, France
        <br />
        SIRET : {brand.legal.siret} — SIREN : {brand.legal.siren}
        {legal.rcsCity && (
          <>
            <br />
            RCS {legal.rcsCity} {brand.legal.siren}
          </>
        )}
        {legal.vat && (
          <>
            <br />
            TVA intracommunautaire : {legal.vat}
          </>
        )}
        <br />
        Téléphone : <a href={store.phoneHref}>{store.phone}</a>
        {store.email && (
          <>
            <br />
            Email : <a href={`mailto:${store.email}`}>{store.email}</a>
          </>
        )}
      </p>
      {legal.publicationDirector && <p>Direction de la publication : {legal.publicationDirector}.</p>}

      <h2>Hébergement</h2>
      <p>{legal.host}</p>
      <p>Données : {legal.database}</p>

      <h2>Paiement en ligne</h2>
      <p>{legal.payment}. Les données de carte bancaire sont saisies et traitées exclusivement par Stripe : elles ne transitent pas par nos serveurs et ne sont jamais stockées par Burger By M.</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom, le logo, les textes et les photographies du site sont la propriété de {brand.legal.companyName} ou utilisés avec autorisation. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite. Les photographies des plats sont
        non contractuelles.
      </p>

      <h2>Responsabilité</h2>
      <p>Les informations du site (carte, prix, horaires) sont mises à jour régulièrement depuis l’administration du restaurant. En cas de différence, les informations communiquées au restaurant font foi.</p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Voir la <a href="/legal/confidentialite">politique de confidentialité</a> et la <a href="/legal/cookies">politique cookies</a>.
      </p>
    </LegalPage>
  );
}
