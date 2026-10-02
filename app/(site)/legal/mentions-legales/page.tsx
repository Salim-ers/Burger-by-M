import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { legal } from "@/data/legal";
import { fullAddress, restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Mentions légales", description: "Mentions légales du site Burger By M, Rantigny.", path: "/legal/mentions-legales" });

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <ul>
          <li>Nom commercial : {restaurant.name}</li>
          <li>Exploitant : {legal.publisher}</li>
          <li>{legal.legalForm}</li>
          <li>Adresse : {fullAddress}</li>
          <li>Téléphone : {restaurant.phone.display}</li>
          <li>{legal.siren}</li>
          <li>{legal.rcs}</li>
          <li>{legal.vat}</li>
          <li>Direction de la publication : {legal.director}</li>
        </ul>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>{legal.host}</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Le logo, les photographies et les contenus de ce site sont la propriété de {restaurant.name} ou utilisés avec autorisation. Toute reproduction sans accord préalable est interdite. Les photos
          des produits sont non contractuelles.
        </p>
      </section>
      <section>
        <h2>Commandes en ligne</h2>
        <p>Les commandes passées sur ce site sont à retirer au restaurant et réglées sur place. Les prix sont indiqués en euros TTC.</p>
      </section>
      <p className="text-sm text-ink/55">Dernière mise à jour : {legal.lastUpdate}</p>
    </LegalPage>
  );
}
