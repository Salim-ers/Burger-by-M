import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getPublicStore } from "@/features/public-data";
import { brand } from "@/data/brand";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Politique de confidentialité", description: "Données personnelles et commande en ligne Burger By M : données collectées, finalités, durées de conservation, vos droits.", path: "/legal/confidentialite" });

export default async function ConfidentialitePage() {
  const store = await getPublicStore();
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>
        {brand.legal.companyName} ({brand.legal.legalForm}, SIRET {brand.legal.siret}), {store.street}, {store.postalCode} {store.city}. Téléphone : <a href={store.phoneHref}>{store.phone}</a>
        {store.email && (
          <>
            {" "}
            — email : <a href={`mailto:${store.email}`}>{store.email}</a>
          </>
        )}
        .
      </p>

      <h2>Données collectées</h2>
      <p>Lors d’une commande : prénom, nom, téléphone, email, contenu de la commande, heure de retrait, précisions éventuelles et statut du paiement. Le site ne demande ni compte client, ni date de naissance, ni adresse postale.</p>
      <p>Les données de carte bancaire sont saisies directement sur la page de paiement de Mollie : Burger By M n’y a jamais accès et ne les stocke pas.</p>
      <p>Pour la sécurité du service, l’adresse IP est utilisée temporairement pour limiter les abus (nombre de tentatives) et figure dans les journaux techniques de l’hébergeur.</p>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Préparer la commande, vous prévenir en cas de souci, vous envoyer la confirmation : exécution du contrat (art. 6.1.b du RGPD).</li>
        <li>Tenir la comptabilité et répondre aux obligations légales : obligation légale (art. 6.1.c).</li>
        <li>Prévenir la fraude et sécuriser le site : intérêt légitime (art. 6.1.f).</li>
      </ul>
      <p>Aucune donnée n’est vendue ni utilisée à des fins publicitaires. Le site n’utilise aucun outil de mesure d’audience.</p>

      <h2>Destinataires et sous-traitants</h2>
      <ul>
        <li>L’équipe du restaurant (préparation et suivi des commandes).</li>
        <li>Vercel Inc. (hébergement du site) — transferts encadrés par les clauses contractuelles types de la Commission européenne.</li>
        <li>Neon Inc. (base de données PostgreSQL).</li>
        <li>Mollie B.V. (paiement en ligne).</li>
        <li>Resend (envoi de l’email de confirmation, lorsqu’il est activé).</li>
        <li>Google (carte Google Maps, uniquement si vous choisissez de l’afficher).</li>
      </ul>

      <h2>Durées de conservation</h2>
      <ul>
        <li>Commandes et données associées : pendant la durée nécessaire à leur traitement, puis archivées pendant 10 ans au titre des obligations comptables (article L123-22 du Code de commerce).</li>
        <li>Données de limitation des abus (adresse IP) : quelques minutes à quelques heures.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Pour les exercer, contactez le restaurant (coordonnées ci-dessus) en indiquant votre numéro de commande. Vous pouvez introduire une
        réclamation auprès de la CNIL (cnil.fr).
      </p>

      <h2>Cookies et stockage local</h2>
      <p>
        Voir la <a href="/legal/cookies">politique cookies</a>.
      </p>
    </LegalPage>
  );
}
