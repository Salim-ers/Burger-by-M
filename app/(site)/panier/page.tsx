import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: true },
};

export default function PanierPage() {
  return (
    <>
      <header className="shell pt-8 pb-6 md:pt-12 md:pb-8">
        <h1 className="font-display text-[3rem] leading-none md:text-[4.2rem]">Votre panier</h1>
      </header>
      <CartPage />
    </>
  );
}
