import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Cookies", description: "Utilisation des cookies et traceurs sur le site Burger By M.", path: "/legal/cookies" });

export default function Cookies() {
  return (
    <LegalPage title="Cookies">
      <section>
        <h2>Ce que nous utilisons</h2>
        <p>
          Le site n’utilise aucun cookie publicitaire ni outil de mesure d’audience à ce jour. Il utilise uniquement le stockage local du navigateur, strictement nécessaire au fonctionnement du
          panier.
        </p>
      </section>
      <section>
        <h2>Contenus tiers</h2>
        <p>
          La carte Google Maps de la page « Le restaurant » n’est chargée qu’après ton clic sur « Afficher la carte ». Google peut alors déposer ses propres cookies. Le lien « Ouvrir dans Google
          Maps » ne dépose rien sur ce site.
        </p>
      </section>
      <section>
        <h2>Évolutions</h2>
        <p>TODO_LEGAL : si un outil de mesure d’audience est ajouté, mettre en place un bandeau de consentement conforme et mettre à jour cette page.</p>
      </section>
    </LegalPage>
  );
}
