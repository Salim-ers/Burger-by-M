import type { Metadata } from "next";
import { DemoHub } from "@/components/demo/DemoHub";

export const metadata: Metadata = { title: "Démonstration", robots: { index: false, follow: false } };

/** Point d'entrée de la démonstration : le parcours client et l'écran cuisine, sans vraie commande. */
export default function DemoPage() {
  return <DemoHub />;
}
