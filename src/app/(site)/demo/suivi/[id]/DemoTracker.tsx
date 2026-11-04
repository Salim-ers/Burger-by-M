"use client";

import { useCallback, useEffect, useState } from "react";
import { OrderTracking } from "@/components/checkout/OrderTracking";
import { ButtonLink } from "@/components/ui/Button";
import { demoPublicOrder } from "@/features/demo/store";
import type { PublicOrder } from "@/features/orders/public";

/** Suivi d'une commande de démonstration : lue dans ce navigateur, mise à jour par l'onglet cuisine. */
export function DemoTracker({ id }: { id: string }) {
  const [initial, setInitial] = useState<PublicOrder | null | undefined>(undefined);
  const load = useCallback(() => demoPublicOrder(id), [id]);
  useEffect(() => setInitial(load()), [load]);

  if (initial === undefined) return <div data-theme="dark" className="on-dark min-h-svh bg-ink" aria-busy />;
  if (initial === null) {
    return (
      <section data-theme="dark" className="on-dark flex min-h-[80svh] items-end bg-ink pt-36 pb-20 md:pb-28">
        <div className="container-bm">
          <p className="t-label text-cheddar">Démonstration</p>
          <h1 className="t-xl mt-6">Commande introuvable sur cet appareil.</h1>
          <ButtonLink href="/demo" variant="ivory" size="lg" arrow className="mt-10">
            Revenir à la démonstration
          </ButtonLink>
        </div>
      </section>
    );
  }
  return <OrderTracking orderNumber={initial.orderNumber} token="" initial={initial} load={load} />;
}
