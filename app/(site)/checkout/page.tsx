import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderHeader } from "@/components/ordering/OrderHeader";

export const metadata: Metadata = {
  title: "Finaliser la commande",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <OrderHeader title="Dernière étape." active={[3, 4]} />
      <CheckoutForm />
    </>
  );
}
