import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { legal } from "@/data/legal";
import { restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Politique de confidentialité", description: "Comment Burger By M traite vos données personnelles.", path: "/legal/confidentialite" });

export default function Confidentialite() {
  return (
    <LegalPage title="Confidentialité">
      <section>
        <h2>Responsable du traitement</h2>
        <p>{legal.publisher}, exploitant de {restaurant.name}.</p>
      </section>
      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>Commande : prénom, nom, téléphone, email, contenu de la commande, heure de retrait, instructions.</li>
          <li>Contact : nom, email, téléphone (facultatif), message.</li>
          <li>Newsletter : email, uniquement si tu as coché la case correspondante.</li>
        </ul>
      </section>
      <section>
        <h2>Finalités et bases légales</h2>
        <ul>
          <li>Préparer et remettre ta commande, te joindre en cas de besoin (exécution du contrat).</li>
          <li>Répondre à tes messages (intérêt légitime).</li>
          <li>T’envoyer nos actualités (consentement, retirable à tout moment).</li>
        </ul>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>TODO_LEGAL : durées de conservation à définir par l’exploitant (commandes, prospection, messages).</p>
      </section>
      <section>
        <h2>Tes droits</h2>
        <p>
          Accès, rectification, effacement, limitation, opposition et portabilité. Pour les exercer : {legal.dpoContact}. Tu peux aussi saisir la CNIL (cnil.fr).
        </p>
      </section>
      <section>
        <h2>Stockage local</h2>
        <p>Ton panier est conservé dans le stockage local de ton navigateur pour ne pas le perdre en cours de commande. Il ne contient aucune donnée de paiement.</p>
      </section>
    </LegalPage>
  );
}
