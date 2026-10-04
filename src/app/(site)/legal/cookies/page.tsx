import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { ConsentControls } from "@/components/legal/ConsentControls";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Cookies et stockage local", description: "Cookies et stockage local utilisés par le site Burger By M, et gestion de votre consentement.", path: "/legal/cookies" });

const rows: [string, string, string, string][] = [
  ["bym-cart-v2", "Stockage local", "Mémoriser votre panier sur cet appareil", "Jusqu’à la commande ou suppression"],
  ["bym-pending-order", "Stockage de session", "Suivre un paiement en cours dans l’onglet", "Fermeture de l’onglet"],
  ["bym-consent", "Stockage local", "Mémoriser votre choix pour la carte Google Maps", "Jusqu’au retrait du consentement"],
  ["bym.session_token", "Cookie (httpOnly, sécurisé)", "Connexion à l’administration (équipe du restaurant uniquement)", "14 jours"],
  ["__stripe_mid, __stripe_sid", "Cookies Stripe", "Sécurité et prévention de la fraude lors d’un paiement en ligne", "1 an / 30 minutes"],
];

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies et stockage local">
      <h2>Ce que le site dépose</h2>
      <p>Le site n’utilise ni mesure d’audience, ni publicité, ni réseau social intégré. Il n’utilise que les éléments strictement nécessaires à son fonctionnement, exemptés de consentement :</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Type</th>
            <th scope="col">Finalité</th>
            <th scope="col">Durée</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, purpose, duration]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{type}</td>
              <td>{purpose}</td>
              <td>{duration}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Contenus tiers soumis à votre accord</h2>
      <p>La carte Google Maps de la page « Le restaurant » n’est chargée que si vous cliquez sur « Afficher la carte ». Google peut alors déposer ses propres cookies. Vous pouvez retirer votre accord à tout moment :</p>
      <ConsentControls />
    </LegalPage>
  );
}
