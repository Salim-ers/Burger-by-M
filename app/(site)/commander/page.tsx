import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { MenuView } from "@/components/menu/MenuView";
import { CartPanel } from "@/components/cart/CartPanel";
import { fullAddress } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Commander à emporter",
  description: "Commandez vos burgers Burger By M en ligne et retirez-les au 19 avenue de la Gare à Rantigny. Retrait dès que possible ou à l’heure choisie.",
  path: "/commander",
});

export default function CommanderPage() {
  return (
    <>
      <header className="shell pt-8 pb-8 md:pt-14 md:pb-12">
        <h1 className="font-display text-[3.4rem] leading-[0.95] md:text-[5.5rem]">Commander</h1>
        <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted md:text-lg">Touchez « + » pour ajouter un produit, puis validez votre panier. Paiement sur place au retrait.</p>
        <p className="mt-3 flex items-center gap-2 text-[0.95rem] font-semibold">
          <MapPin className="size-4 shrink-0" aria-hidden /> Retrait : {fullAddress}
        </p>
      </header>
      <MenuView aside={<CartPanel />} />
    </>
  );
}
