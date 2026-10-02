"use client";

import Link from "next/link";
import { useRef } from "react";
import { CartItemRow } from "./CartItemRow";
import { PickupSummary } from "./PickupSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { AddButton } from "@/components/product/AddButton";
import { OrderingNotice } from "@/components/ordering/OrderingNotice";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useMenuProducts, useOrdering } from "@/hooks/use-menu";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/product";

const UPSELL = ["dubai-shake", "bueno-bomb", "tiramisu"];

/** Étape 2 — panier (fond blanc cassé, récapitulatif noir). */
export function CartPage() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const products = useMenuProducts();
  const { accepting } = useOrdering();

  if (!hydrated) return <div className="min-h-[60vh] bg-bone" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="scheme-light bg-bone">
        <EmptyState className="min-h-[60vh] justify-center" lines={["Ton panier", "a faim."]} text="Rien pour l’instant. La carte, elle, est pleine." action={{ href: "/commander", label: "Voir la carte" }} />
      </div>
    );
  }

  const inCart = new Set(items.map((i) => i.productId));
  const upsell = UPSELL.map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p && p.available && !inCart.has(p.id)))
    .slice(0, 2);
  const count = cartCount(items);

  return (
    <div className="scheme-light bg-bone pt-10 pb-24 text-ink md:pt-14">
      <div className="shell grid-12 gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-3xl">Ta sélection</h2>
            <span className="kicker text-ink/55 tabular-nums">
              {count} article{count > 1 ? "s" : ""}
            </span>
          </div>
          <ul className="divide-y divide-ink/12">
            {items.map((i) => (
              <CartItemRow key={i.lineId} item={i} size="lg" />
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-ink/12 pt-4 text-sm">
            <Link href="/commander" className="font-semibold underline-offset-4 hover:underline">
              ← Continuer mes achats
            </Link>
            <button type="button" onClick={clearCart} className="text-ink/55 underline-offset-4 hover:text-ink hover:underline">
              Vider le panier
            </button>
          </div>

          {upsell.length > 0 && (
            <section aria-labelledby="upsell-title" className="mt-14">
              <h2 id="upsell-title" className="font-display text-d4">
                Un shake avec ça&nbsp;?
              </h2>
              <ul className="mt-5 border-t-2 border-ink">
                {upsell.map((p) => (
                  <UpsellItem key={p.id} product={p} />
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="summary-title" className="col-span-12 lg:col-span-5">
          <div className="scheme-dark space-y-5 bg-ink p-5 text-bone md:p-7 lg:sticky lg:top-24">
            <h2 id="summary-title" className="kicker text-bone/55">
              Récapitulatif
            </h2>
            <dl className="space-y-2 text-[0.95rem]">
              <div className="flex justify-between">
                <dt className="text-bone/70">Sous-total</dt>
                <dd className="tabular-nums">{formatPrice(cartSubtotal(items))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-bone/70">Retrait au restaurant</dt>
                <dd>Gratuit</dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between border-t border-graphite pt-5">
              <span className="kicker">Total</span>
              <span className="font-display text-5xl tabular-nums">
                <Price cents={cartSubtotal(items)} />
              </span>
            </div>
            <PickupSummary className="text-sm text-bone/60" />
            <OrderingNotice />
            <ButtonLink href="/checkout" variant="primary" size="xl" arrow className="w-full justify-between" aria-disabled={!accepting || undefined}>
              Étape suivante : infos
            </ButtonLink>
            <p className="text-center text-xs text-bone/50">Paiement sur place au moment du retrait.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UpsellItem({ product }: { product: Product }) {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li ref={ref} className="flex items-center justify-between gap-4 border-b border-ink/15 py-4">
      <div>
        <p className="font-display text-2xl leading-none">{product.name}</p>
        <Price cents={product.price} className="mt-1 block text-sm text-ink/60" />
      </div>
      <AddButton product={product} sourceRef={ref} />
    </li>
  );
}
