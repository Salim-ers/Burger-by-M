"use client";

import { ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { CartItemRow } from "./CartItemRow";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoreStatus } from "@/hooks/use-store-status";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

/** Panier latéral collant (desktop) de /commander. */
export function CartPanel() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const status = useStoreStatus();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <aside aria-labelledby="panel-title" className="flex max-h-[calc(100dvh-11rem)] flex-col rounded-xl border border-line bg-white">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
        <h2 id="panel-title" className="text-lg font-bold">
          Votre commande
        </h2>
        <span className="text-sm text-muted tabular-nums">
          {count} article{count > 1 ? "s" : ""}
        </span>
      </div>
      {!hydrated || items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-cream">
            <ShoppingBag className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Votre panier est vide</p>
          <p className="mt-1 text-sm text-muted">Touchez « + » sur un produit pour l’ajouter.</p>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
            {items.map((i) => (
              <CartItemRow key={i.lineId} item={i} compact />
            ))}
          </ul>
          <div className="border-t border-line p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold tabular-nums">{formatPrice(cartSubtotal(items))}</span>
            </div>
            {status.ready && !status.canOrder && <p className="mt-3 text-sm font-semibold text-closed">{status.blockedMessage}</p>}
            <ButtonLink href="/panier" variant="dark" size="lg" className="mt-4 w-full">
              Voir mon panier
            </ButtonLink>
          </div>
        </>
      )}
    </aside>
  );
}
