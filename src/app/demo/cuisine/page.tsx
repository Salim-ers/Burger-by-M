import type { Metadata } from "next";
import { DemoKitchen } from "./DemoKitchen";

export const metadata: Metadata = { title: "Cuisine (démonstration)" };

/** Écran cuisine de démonstration : le vrai écran, sans base ni compte, sur les commandes de démo de ce navigateur. */
export default function DemoKitchenPage() {
  return (
    <div className="on-dark min-h-dvh bg-ink text-fg">
      <DemoKitchen />
    </div>
  );
}
