"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/features/cart/store";
import { subscribeDemo, useDemo } from "@/features/demo/store";

/**
 * Active le mode démo (?demo=1 ou ?demo=0) et l'affiche en permanence quand il est actif :
 * un visiteur ne peut pas croire qu'il passe une vraie commande.
 */
export function DemoBanner() {
  const active = useDemo((s) => s.active);
  const pathname = usePathname();

  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (demo === "1") useDemo.getState().set(true);
    else if (demo === "0") useDemo.getState().set(false);
    else useDemo.getState().sync();
    return subscribeDemo(() => useDemo.getState().sync());
  }, [pathname]);

  if (!active) return null;
  const quit = () => {
    useCart.getState().clear();
    useDemo.getState().set(false);
  };
  return (
    <div role="status" className="on-dark fixed bottom-20 left-3 z-[45] flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-ink px-4 py-2.5 text-[0.82rem] text-cream shadow-lift ring-1 ring-white/15 md:bottom-4">
      <span className="t-label text-cheddar">Mode démo</span>
      <span className="text-cream/80">Aucune commande transmise, aucun paiement.</span>
      <Link href="/demo/cuisine" target="_blank" className="font-semibold underline underline-offset-2">
        Ouvrir la cuisine
      </Link>
      <button type="button" onClick={quit} className="font-semibold underline underline-offset-2">
        Quitter
      </button>
    </div>
  );
}
