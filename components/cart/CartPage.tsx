"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartItemRow } from "./CartItemRow";
import { PickupSummary } from "./PickupSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useStoreStatus } from "@/hooks/use-store-status";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

/** /panier : produits, options, quantités, total, puis « Continuer ». */
export function CartPage() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const status = useStoreStatus();

  if (!hydrated) return <div className="min-h-[50vh]" aria-busy="true" />;

  if (items.length === 0) {
    return <EmptyState className="min-h-[50vh] justify-center" title="Votre panier est vide" text="Parcourez la carte et touchez « + » pour ajouter un produit." action={{ href: "/menu", label: "Voir la carte" }} />;
  }

  const count = cartCount(items);
  const total = cartSubtotal(items);
  const blocked = status.ready && !status.canOrder;

  return (
    <div className="shell grid gap-6 pb-16 lg:grid-cols-[1fr_380px] lg:gap-8">
      <section aria-labelledby="cart-items" className="rounded-xl border border-line bg-white px-4 md:px-6">
        <div className="flex items-baseline justify-between border-b border-line py-4">
          <h2 id="cart-items" className="text-lg font-bold">
            {count} article{count > 1 ? "s" : ""}
          </h2>
          <button type="button" onClick={clearCart} className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
            Vider le panier
          </button>
        </div>
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <CartItemRow key={i.lineId} item={i} />
          ))}
        </ul>
      </section>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-5 md:p-6">
          <h2 id="summary-title" className="text-lg font-bold">
            Récapitulatif
          </h2>
          <dl className="mt-4 space-y-2 text-[0.95rem]">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd className="tabular-nums">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Retrait sur place</dt>
              <dd>Gratuit</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-bold">Total</dt>
              <dd className="text-2xl font-bold tabular-nums">{formatPrice(total)}</dd>
            </div>
          </dl>
          <PickupSummary className="mt-4 text-sm text-muted" />
          {blocked && <p className="mt-4 rounded-lg bg-closed/8 p-3 text-sm font-semibold text-closed">{status.blockedMessage}</p>}
          <ButtonLink href="/checkout" variant="dark" size="lg" arrow className="mt-5 w-full" aria-disabled={blocked || undefined}>
            Continuer
          </ButtonLink>
          <p className="mt-3 text-center text-xs text-muted">Paiement sur place au moment du retrait.</p>
        </div>
        <Link href="/menu" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Continuer mes achats
        </Link>
      </aside>
    </div>
  );
}
