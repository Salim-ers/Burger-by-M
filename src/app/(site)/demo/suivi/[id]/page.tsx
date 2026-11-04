import type { Metadata } from "next";
import { DemoTracker } from "./DemoTracker";

export const metadata: Metadata = { title: "Suivi de commande (démonstration)", robots: { index: false, follow: false } };

export default async function DemoTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DemoTracker id={id} />;
}
