"use client";

import { Price } from "@/components/ui/Price";
import { BagLineArt } from "@/components/ui/LineArt";
import { ButtonLink } from "@/components/ui/Button";
import { CartItemRow } from "./CartItemRow";
import { useCartStore } from "@/stores/cart-store";
import { useOrdering } from "@/hooks/use-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

/** Panier latéral collant (desktop) de /commander. */
export function CartPanel() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const { accepting } = useOrdering();
  const count = cartCount(items);

  return (
    <aside aria-labelledby="panel-title" className="flex max-h-[calc(100dvh-8rem)] flex-col rounded-sm border border-cream/12 bg-ink-warm">
      <div className="flex items-baseline justify-between px-6 pt-6 pb-3">
        <h2 id="panel-title" className="font-display text-3xl uppercase">
          Ton panier
        </h2>
        <span className="text-sm text-cream/55 tabular-nums">{hydrated ? count : 0}</span>
      </div>
      {!hydrated || items.length === 0 ? (
        <div className="flex flex-col items-center px-6 pt-6 pb-10 text-center">
          <BagLineArt className="w-20 text-rose" />
          <p className="mt-5 font-display text-2xl leading-none uppercase">
            Ton panier
            <br />a faim.
          </p>
          <p className="mt-3 text-sm text-cream/55">Ajoute un burger depuis la carte.</p>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-cream/10 overflow-y-auto overscroll-contain px-6">
            {items.map((i) => (
              <CartItemRow key={i.lineId} item={i} />
            ))}
          </ul>
          <div className="border-t border-cream/10 p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold uppercase">Total</span>
              <span className="font-display text-3xl tabular-nums"><Price cents={cartSubtotal(items)} /></span>
            </div>
            <ButtonLink href="/checkout" variant="rose" size="lg" arrow className="mt-5 w-full" aria-disabled={!accepting || undefined}>
              Valider ma commande
            </ButtonLink>
          </div>
        </>
      )}
    </aside>
  );
}
