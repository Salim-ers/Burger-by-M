"use client";

import Link from "next/link";
import { ChefHat, ShoppingBag } from "lucide-react";
import { useDemo } from "@/features/demo/store";

const CARD = "flex flex-col rounded-2xl border border-rule bg-charcoal p-7 md:p-9";
const ACTION = "t-btn mt-8 inline-flex h-14 w-fit items-center rounded-full px-8 transition-colors";

/** Choix du parcours à montrer. Rien n'est envoyé au restaurant : tout reste dans ce navigateur. */
export function DemoHub() {
  return (
    <section data-theme="dark" className="on-dark min-h-svh bg-ink pt-28 pb-24 md:pt-36">
      <div className="container-bm">
        <p className="t-label text-cheddar">Démonstration</p>
        <h1 className="t-xl mt-5">Essayez le site en conditions réelles.</h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-cream/75">Aucune commande n’est envoyée au restaurant et aucun paiement n’a lieu : tout reste dans ce navigateur.</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className={CARD}>
            <ShoppingBag aria-hidden className="size-7 text-cheddar" strokeWidth={1.75} />
            <h2 className="t-m mt-5">Commander en client</h2>
            <p className="mt-3 max-w-md leading-relaxed text-cream/70">Composez un burger, choisissez votre heure de retrait, passez au paiement simulé, puis suivez votre commande en direct.</p>
            <Link href="/menu?demo=1" onClick={() => useDemo.getState().set(true)} className={`${ACTION} bg-cheddar text-ink hover:bg-cream`}>
              Passer une commande
            </Link>
          </div>
          <div className={CARD}>
            <ChefHat aria-hidden className="size-7 text-cheddar" strokeWidth={1.75} />
            <h2 className="t-m mt-5">Écran cuisine</h2>
            <p className="mt-3 max-w-md leading-relaxed text-cream/70">Recevez les commandes avec la sonnerie, acceptez ou refusez, préparez, terminez : le client suit chaque étape.</p>
            <Link href="/demo/cuisine" target="_blank" className={`${ACTION} border border-cream/30 text-cream hover:border-cream`}>
              Ouvrir la cuisine
            </Link>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-[0.95rem] leading-relaxed text-cream/60">
          Pour tout montrer : ouvrez la cuisine dans un onglet et la commande dans un autre, <strong className="font-semibold text-cream/85">dans le même navigateur</strong>. La commande arrive en cuisine en direct. Sur une tablette seule, le bouton « Simuler une commande » de la cuisine en crée une.
        </p>
      </div>
    </section>
  );
}
