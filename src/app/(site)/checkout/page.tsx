import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Commander",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="on-light min-h-[80vh] bg-ivory">
      <CheckoutFlow />
    </div>
  );
}
