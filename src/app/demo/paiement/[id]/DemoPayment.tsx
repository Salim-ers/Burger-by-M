"use client";

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/features/cart/store";
import { demoPayment, getDemoOrder } from "@/features/demo/store";
import type { OrderView } from "@/features/orders/service";
import { formatPrice } from "@/lib/money";

const ACTION = "t-btn flex h-14 w-full items-center justify-center rounded-full transition-colors disabled:opacity-40";

/** Page de paiement simulée, à la place de la page Mollie : aucune carte n'est demandée ni débitée. */
export function DemoPayment({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderView | null | undefined>(undefined);
  useEffect(() => setOrder(getDemoOrder(id)), [id]);

  const pay = (outcome: "authorized" | "failed" | "canceled") => {
    demoPayment(id, outcome);
    if (outcome === "authorized") {
      // Le panier est persistant et n'a pas été rechargé sur cette page : on le rétablit avant de le vider.
      void Promise.resolve(useCart.persist.rehydrate()).then(() => {
        useCart.getState().clear();
        window.location.assign(`/demo/suivi/${id}`);
      });
      return;
    }
    window.location.assign(outcome === "failed" ? `/demo/suivi/${id}` : "/checkout");
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-ivory p-5 text-ink">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-lift">
        <p className="t-label text-danger">Démonstration, aucune carte débitée</p>
        <h1 className="t-m mt-3 flex items-center gap-2">
          <Lock aria-hidden className="size-5" /> Paiement sécurisé
        </h1>
        {order === null ? (
          <p className="mt-4">Commande de démonstration introuvable.</p>
        ) : (
          <>
            <p className="mt-3 text-[0.98rem] text-ink/70">
              Burger By M, commande {order?.orderNumber ?? "…"} : <strong className="font-bold text-ink">{order ? formatPrice(order.totalCents) : "…"}</strong>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">En réel, c’est ici la page Mollie : le montant est réservé sur la carte, puis encaissé quand la cuisine accepte.</p>
            <div className="mt-6 grid gap-2.5">
              <button type="button" disabled={!order} onClick={() => pay("authorized")} className={`${ACTION} bg-ink text-cream hover:bg-cheddar hover:text-ink`}>
                Payer (carte autorisée)
              </button>
              <button type="button" disabled={!order} onClick={() => pay("failed")} className={`${ACTION} border border-danger/40 text-danger hover:bg-danger/5`}>
                Simuler une carte refusée
              </button>
              <button type="button" disabled={!order} onClick={() => pay("canceled")} className={`${ACTION} border border-ink/20 hover:border-ink`}>
                Abandonner le paiement
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
