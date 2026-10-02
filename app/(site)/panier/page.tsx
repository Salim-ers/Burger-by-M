import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { OrderHeader } from "@/components/ordering/OrderHeader";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: true },
};

export default function PanierPage() {
  return (
    <>
      <OrderHeader title="Panier." active={[2]} />
      <CartPage />
    </>
  );
}
