"use client";

import { Price } from "@/components/ui/Price";
import { ButtonLink } from "@/components/ui/Button";
import { CartItemRow } from "./CartItemRow";
import { PickupSummary } from "./PickupSummary";
import { useCartStore } from "@/stores/cart-store";
import { useOrdering } from "@/hooks/use-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount, cartSubtotal } from "@/lib/order";

/** Panier latéral collant (desktop) de /commander : bloc noir sur la page claire. */
export function CartPanel() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const { accepting } = useOrdering();
  const count = hydrated ? cartCount(items) : 0;
  const empty = !hydrated || items.length === 0;

  return (
    <aside aria-labelledby="panel-title" className="scheme-dark flex max-h-[calc(100dvh-7.5rem)] flex-col bg-ink text-bone">
      <div className="flex items-baseline justify-between border-b border-graphite px-5 pt-5 pb-3">
        <h2 id="panel-title" className="font-display text-4xl leading-none">
          Panier
        </h2>
        <span className="font-display text-2xl text-cheddar tabular-nums">({count})</span>
      </div>
      {empty ? (
        <div className="px-5 py-10">
          <p className="font-display text-3xl leading-[0.95]">
            Vide pour l’instant<span className="text-cheddar">.</span>
          </p>
          <p className="mt-3 text-sm text-bone/55">Ajoute un produit avec le bouton « + ».</p>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-graphite overflow-y-auto overscroll-contain px-5">
            {items.map((i) => (
              <CartItemRow key={i.lineId} item={i} />
            ))}
          </ul>
          <div className="border-t border-graphite p-5">
            <PickupSummary className="text-xs text-bone/55" />
            <div className="mt-3 flex items-baseline justify-between">
              <span className="kicker">Total</span>
              <span className="font-display text-4xl tabular-nums">
                <Price cents={cartSubtotal(items)} />
              </span>
            </div>
            <ButtonLink href="/panier" variant="primary" size="lg" arrow className="mt-4 w-full" aria-disabled={!accepting || undefined}>
              Valider le panier
            </ButtonLink>
          </div>
        </>
      )}
    </aside>
  );
}
