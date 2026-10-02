import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { CartPanel } from "@/components/cart/CartPanel";
import { PickupSelector } from "@/components/ordering/PickupSelector";
import { OrderingNotice } from "@/components/ordering/OrderingNotice";
import { ModeSwitch } from "@/components/ordering/ModeSwitch";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { restaurant } from "@/data/restaurant";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Commander à emporter",
  description: "Commandez vos burgers Burger By M en ligne et récupérez-les au 19 avenue de la Gare à Rantigny. Retrait dès que possible ou sur créneau.",
  path: "/commander",
});

export default function CommanderPage() {
  return (
    <>
      <header className="bg-ink pt-32 pb-12 md:pt-44 md:pb-16">
        <div className="container-site">
          <h1 className="font-display text-[clamp(2.4rem,9vw,8rem)] leading-[0.86] font-medium tracking-[-0.03em] uppercase">Commander.</h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <ModeSwitch />
              <div className="space-y-2 text-sm text-cream/75">
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-rose" aria-hidden /> Retrait : {restaurant.address.street}, {restaurant.address.city}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-rose" aria-hidden />
                  <a href={restaurant.phone.href} className="hover:underline">
                    {restaurant.phone.display}
                  </a>
                </p>
                <OpeningStatus className="pt-1" />
              </div>
            </div>
            <div className="space-y-4 lg:col-span-7">
              <OrderingNotice />
              <h2 className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Quand passes-tu ?</h2>
              <PickupSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="lg:container-site lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8 lg:[&_.container-site]:px-0">
          <MenuBrowser showBanners={false} />
        </div>
        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 pt-20">
            <CartPanel />
          </div>
        </div>
      </div>
    </>
  );
}
