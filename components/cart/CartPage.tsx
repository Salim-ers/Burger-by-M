"use client";

import Link from "next/link";
import { useRef } from "react";
import { CartItemRow } from "./CartItemRow";
import { PickupSummary } from "./PickupSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { BagLineArt } from "@/components/ui/LineArt";
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

export function CartPage() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const products = useMenuProducts();
  const { accepting } = useOrdering();

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <EmptyState
        className="min-h-[70vh] justify-center pt-32"
        art={<BagLineArt />}
        lines={["Ton panier", "a faim."]}
        text="Rien pour l’instant. La carte, elle, est pleine."
        action={{ href: "/menu", label: "Découvrir la carte" }}
      />
    );
  }

  const inCart = new Set(items.map((i) => i.productId));
  const upsell = UPSELL.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p && p.available && !inCart.has(p.id))).slice(0, 2);
  const count = cartCount(items);

  return (
    <div className="container-site pt-32 pb-24 md:pt-44">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-giant font-medium uppercase">Ton panier.</h1>
        <p className="pb-3 text-sm text-cream/60 tabular-nums">
          {count} article{count > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ul className="divide-y divide-cream/10 border-y border-cream/10">
            {items.map((i) => (
              <CartItemRow key={i.lineId} item={i} size="lg" />
            ))}
          </ul>
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/commander" className="text-cream/70 underline-offset-4 hover:text-cream hover:underline">
              Continuer mes achats
            </Link>
            <button type="button" onClick={clearCart} className="text-cream/50 underline-offset-4 hover:text-cream hover:underline">
              Vider le panier
            </button>
          </div>

          {upsell.length > 0 && (
            <section aria-labelledby="upsell-title" className="mt-16">
              <h2 id="upsell-title" className="font-display text-3xl uppercase">
                Une petite douceur&nbsp;?
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {upsell.map((p) => (
                  <UpsellItem key={p.id} product={p} />
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="summary-title" className="lg:col-span-5">
          <div className="space-y-6 rounded-sm border border-cream/12 bg-ink-warm p-6 md:p-8 lg:sticky lg:top-28">
            <h2 id="summary-title" className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">
              Récapitulatif
            </h2>
            <dl className="space-y-3 text-[0.95rem]">
              <div className="flex justify-between">
                <dt className="text-cream/70">Sous-total</dt>
                <dd className="tabular-nums">{formatPrice(cartSubtotal(items))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream/70">Retrait au restaurant</dt>
                <dd>Gratuit</dd>
              </div>
            </dl>
            <div>
              <label htmlFor="promo" className="text-xs font-semibold text-cream/60">
                Code promo
              </label>
              <div className="mt-2 flex gap-2">
                <input id="promo" disabled placeholder="Bientôt disponible" className="h-12 min-w-0 flex-1 rounded-sm border border-cream/15 bg-transparent px-4 text-sm placeholder:text-cream/35 disabled:opacity-60" />
                <button type="button" disabled className="h-12 rounded-sm border border-cream/15 px-4 text-xs font-bold uppercase opacity-40">
                  OK
                </button>
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t border-cream/10 pt-6">
              <span className="text-sm font-bold uppercase">Total</span>
              <span className="font-display text-4xl tabular-nums"><Price cents={cartSubtotal(items)} /></span>
            </div>
            <PickupSummary className="text-sm text-cream/65" />
            <OrderingNotice />
            <ButtonLink href="/checkout" variant="rose" size="lg" arrow className="w-full" aria-disabled={!accepting || undefined}>
              Valider ma commande
            </ButtonLink>
            <p className="text-center text-xs text-cream/50">Paiement sur place au moment du retrait.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UpsellItem({ product }: { product: Product }) {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li ref={ref} className="flex items-center justify-between gap-4 rounded-sm border border-cream/12 p-4">
      <div>
        <p className="font-display text-xl uppercase">{product.name}</p>
        <Price cents={product.price} className="text-sm text-cream/65" />
      </div>
      <AddButton product={product} sourceRef={ref} variant="pill" />
    </li>
  );
}
