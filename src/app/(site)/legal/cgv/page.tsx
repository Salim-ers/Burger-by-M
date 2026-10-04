import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getPublicStore } from "@/features/public-data";
import { brand } from "@/data/brand";
import { legal } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Conditions générales de vente", description: "Conditions générales de vente de la commande en ligne Burger By M : commande, prix, paiement, retrait, annulation.", path: "/legal/cgv" });

export default async function CgvPage() {
  const store = await getPublicStore();
  return (
    <LegalPage title="Conditions générales de vente">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent les commandes passées sur ce site auprès de {brand.legal.companyName} ({brand.legal.legalForm}, SIRET {brand.legal.siret}), {store.street}, {store.postalCode} {store.city} (« le restaurant »), pour des produits à emporter retirés
        au restaurant. Valider une commande vaut acceptation de ces conditions.
      </p>

      <h2>2. Commande</h2>
      <p>La commande se fait sans création de compte. Le client choisit ses produits, une heure de retrait parmi les créneaux proposés, renseigne ses coordonnées, accepte les présentes conditions puis valide.</p>
      <p>
        La commande est confirmée à l’écran (numéro de commande « M-… ») et, si une adresse email est fournie, par email. Une commande payée en ligne n’est transmise à la cuisine qu’après confirmation du paiement par le prestataire de paiement.
      </p>
      <p>Le restaurant peut suspendre la commande en ligne à tout moment (forte affluence, fermeture, incident). Les créneaux de retrait dépendent des horaires d’ouverture, du temps de préparation et du nombre de commandes déjà prévues.</p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises. Le montant facturé est celui calculé par le restaurant au moment de la validation, à partir de la carte en vigueur ; il est affiché avant le paiement. Le retrait au restaurant est gratuit.
      </p>

      <h2>4. Paiement</h2>
      <ul>
        <li>
          <strong>En ligne</strong> : par carte bancaire (et Apple Pay / Google Pay selon l’appareil) via Stripe. Le paiement est débité à la validation. Les données bancaires sont traitées exclusivement par Stripe.
        </li>
        <li>
          <strong>Au retrait</strong> (lorsque cette option est proposée) : en espèces ou par carte, au comptoir.
        </li>
      </ul>
      <p>Si le paiement en ligne n’aboutit pas, la commande n’est pas préparée et aucune somme n’est débitée ; elle est automatiquement annulée après 30 minutes sans paiement.</p>

      <h2>5. Retrait</h2>
      <p>
        La commande est à retirer au comptoir, {store.street}, {store.postalCode} {store.city}, à l’heure choisie, sur présentation du numéro de commande. L’heure « dès que possible » est une estimation tenant compte du temps de préparation. En cas d’empêchement,
        prévenez le restaurant au <a href={store.phoneHref}>{store.phone}</a>.
      </p>

      <h2>6. Annulation et droit de rétractation</h2>
      <p>
        Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux denrées alimentaires susceptibles de se détériorer rapidement, ni aux prestations de restauration fournies à une date déterminée. Pour toute
        demande d’annulation, contactez le restaurant au plus vite par téléphone.
      </p>
      <p>Si le restaurant ne peut pas honorer une commande (rupture d’un produit, incident), il prend contact avec le client ; une commande payée en ligne et annulée par le restaurant est intégralement remboursée sur le moyen de paiement utilisé.</p>

      <h2>7. Allergènes</h2>
      <p>
        Les recettes peuvent contenir des allergènes (gluten, lait, œufs, moutarde, sésame, etc.). La liste des allergènes de chaque produit est disponible au restaurant, sur simple demande. En cas d’allergie, contactez le restaurant avant de commander.
      </p>

      <h2>8. Réclamations</h2>
      <p>
        Toute réclamation peut être adressée au restaurant par téléphone au <a href={store.phoneHref}>{store.phone}</a>
        {store.email ? (
          <>
            , par email à <a href={`mailto:${store.email}`}>{store.email}</a>
          </>
        ) : null}{" "}
        ou par courrier à l’adresse du restaurant, en précisant le numéro de commande.
      </p>
      {legal.mediator && (
        <p>
          En cas de litige non résolu, le client peut recourir gratuitement au médiateur de la consommation : {legal.mediator.name} — <a href={legal.mediator.url}>{legal.mediator.url}</a>.
        </p>
      )}

      <h2>9. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>
    </LegalPage>
  );
}
