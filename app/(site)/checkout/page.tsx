import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Finaliser la commande",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <header className="shell pt-8 pb-6 md:pt-12 md:pb-8">
        <h1 className="font-display text-[3rem] leading-none md:text-[4.2rem]">Finaliser la commande</h1>
        <p className="mt-3 text-muted">Retrait sur place · paiement au restaurant.</p>
      </header>
      <CheckoutForm />
    </>
  );
}
