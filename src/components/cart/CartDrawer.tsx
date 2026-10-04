"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { checkCart } from "@/features/cart/lines";
import { useSite } from "@/features/site-context";
import { useOrderingNotice, ORDERING_CLOSED_LABEL } from "@/features/store/use-status";
import { Sheet } from "@/components/ui/Sheet";
import { Quantity } from "@/components/ui/Quantity";
import { PhotoPlaceholder } from "@/components/menu/ProductImage";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Panier : tiroir à droite (desktop), bottom sheet plein écran (mobile). Prix recalculés depuis la carte à jour. */
export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const setOpen = useUi((s) => s.setCartOpen);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const lines = useCart((s) => s.lines);
  const { products, store } = useSite();
  const notice = useOrderingNotice();
  const checked = checkCart(lines, products);
  const count = cartCount(lines);
  const belowMin = store.minOrderCents > 0 && checked.subtotalCents < store.minOrderCents;
  const blocked = checked.hasErrors || belowMin || Boolean(notice);

  return (
    <Sheet open={open} onClose={onClose} labelledBy="cart-title" desktop="side">
      <div className="border-b border-rule px-6 pt-7 pb-5 md:pt-9">
        <p className="t-label text-sub tabular-nums">
          {count} article{count > 1 ? "s" : ""}
        </p>
        <h2 id="cart-title" className="t-l mt-2">
          Votre panier
        </h2>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center px-6 py-16">
          <p className="t-m">Encore vide.</p>
          <p className="s-m mt-1 text-sub">La carte, elle, est bien remplie.</p>
          <Link href="/menu" onClick={onClose} className="t-label mt-8 inline-flex h-14 items-center bg-ink px-8 text-cream transition-colors hover:bg-cheddar hover:text-ink">
            Voir la carte
          </Link>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 divide-y divide-rule overflow-y-auto overscroll-contain px-6" data-lenis-prevent>
            {checked.lines.map(({ line, details, lineTotalCents, error }) => (
              <li key={line.key} className="flex gap-4 py-5">
                <div className="relative size-20 shrink-0 overflow-hidden bg-sand">
                  {line.image ? <Image src={line.image.src} alt="" fill sizes="80px" className="object-cover" /> : <PhotoPlaceholder name={line.name} className="size-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="t-s leading-tight">{line.name}</p>
                    <p className="shrink-0 font-semibold tabular-nums">{formatPrice(lineTotalCents)}</p>
                  </div>
                  {details.length > 0 && <p className="mt-1 text-[0.82rem] leading-snug text-sub">{details.join(" · ")}</p>}
                  {error && <p className="mt-1 text-[0.82rem] font-semibold text-danger">{error}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    <Quantity size="sm" value={line.quantity} onChange={(q) => useCart.getState().setQuantity(line.key, q)} label={`Quantité de ${line.name}`} />
                    {products.get(line.productId) && (
                      <button type="button" onClick={() => useUi.getState().openProduct(line.productId, line.key)} className="t-label h-10 px-3 text-[0.62rem] text-sub hover:text-fg">
                        Modifier
                      </button>
                    )}
                    <button type="button" onClick={() => useCart.getState().remove(line.key)} className="t-label h-10 px-3 text-[0.62rem] text-sub hover:text-danger" aria-label={`Supprimer ${line.name}`}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-rule px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-sub">
                <dt>Sous-total</dt>
                <dd className="tabular-nums">{formatPrice(checked.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-sub">
                <dt>Retrait sur place</dt>
                <dd>Gratuit</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="t-label">Total</dt>
                <dd className="t-m tabular-nums">{formatPrice(checked.subtotalCents)}</dd>
              </div>
            </dl>
            {checked.hasErrors && <p className="mt-3 text-sm font-semibold text-danger">Retirez ou modifiez les produits signalés pour continuer.</p>}
            {belowMin && <p className="mt-3 text-sm text-sub">Minimum de commande : {formatPrice(store.minOrderCents)}.</p>}
            {notice && <p className="mt-3 text-sm font-semibold">{notice}</p>}
            <Link
              href="/checkout"
              onClick={(e) => (blocked ? e.preventDefault() : onClose())}
              aria-disabled={blocked || undefined}
              className={cn("t-label mt-5 flex h-16 w-full items-center justify-center text-[0.78rem] transition-colors", blocked ? "pointer-events-none bg-ink/30 text-cream" : "bg-ink text-cream hover:bg-cheddar hover:text-ink")}
            >
              {notice ? ORDERING_CLOSED_LABEL : `Commander · ${formatPrice(checked.subtotalCents)}`}
            </Link>
          </div>
        </>
      )}
    </Sheet>
  );
}
