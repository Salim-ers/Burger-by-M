import type { Metadata } from "next";
import { Confirmation } from "@/components/checkout/Confirmation";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return <Confirmation />;
}
