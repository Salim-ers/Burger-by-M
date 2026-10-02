import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { CartPanel } from "@/components/cart/CartPanel";
import { OrderingNotice } from "@/components/ordering/OrderingNotice";
import { ModeSwitch } from "@/components/ordering/ModeSwitch";
import { OrderHeader } from "@/components/ordering/OrderHeader";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Commander à emporter",
  description: "Commandez vos burgers Burger By M en ligne et récupérez-les au 19 avenue de la Gare à Rantigny. Retrait dès que possible ou sur créneau.",
  path: "/commander",
});

/** Commande : interface simple, conversion avant tout (peu de motion). */
export default function CommanderPage() {
  return (
    <>
      <OrderHeader title="Commander." active={[1]}>
        <div className="mt-8 flex flex-col gap-5 border-t border-graphite pt-6 lg:flex-row lg:items-center lg:justify-between">
          <ModeSwitch />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-bone/75">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-cheddar" aria-hidden /> Retrait : {restaurant.address.street}, {restaurant.address.city}
            </span>
            <a href={restaurant.phone.href} className="flex items-center gap-2 hover:text-bone">
              <Phone className="size-4 shrink-0 text-cheddar" aria-hidden /> {restaurant.phone.display}
            </a>
            <OpeningStatus />
          </div>
        </div>
        <div className="mt-5 empty:hidden">
          <OrderingNotice />
        </div>
      </OrderHeader>

      <div className="scheme-light bg-bone">
        <div className="lg:shell lg:grid-12">
          <div className="lg:col-span-8 lg:[&_.shell]:px-0">
            <MenuBrowser variant="compact" />
          </div>
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 pt-12 pb-12">
              <CartPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
