import type { Metadata } from "next";
import { DemoPayment } from "./DemoPayment";

export const metadata: Metadata = { title: "Paiement (démonstration)" };

export default async function DemoPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DemoPayment id={id} />;
}
