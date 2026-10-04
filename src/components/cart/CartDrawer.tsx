"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { checkCart } from "@/features/cart/lines";
import { useSite } from "@/features/site-context";
import { Sheet } from "@/components/ui/Sheet";
import { Quantity } from "@/components/ui/Quantity";
import { PhotoPlaceholder } from "@/components/menu/ProductImage";
import { buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Panier : tiroir latéral (desktop) / bottom sheet (mobile). */
export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const setOpen = useUi((s) => s.setCartOpen);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const lines = useCart((s) => s.lines);
  const { products, store } = useSite();
  const checked = checkCart(lines, products);
  const count = cartCount(lines);
  const belowMin = store.minOrderCents > 0 && checked.subtotalCents < store.minOrderCents;

  return (
    <Sheet open={open} onClose={onClose} labelledBy="cart-title" desktop="side">
      <div className="flex items-baseline gap-3 border-b border-rule px-6 pt-7 pb-5 md:pt-9">
        <h2 id="cart-title" className="display-4">
          Votre panier
        </h2>
        <span className="text-sm text-sub tabular-nums">
          {count} article{count > 1 ? "s" : ""}
        </span>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <p className="font-serif text-3xl italic">Encore vide.</p>
          <p className="mt-2 text-sub">La carte, elle, est bien remplie.</p>
          <Link href="/menu" onClick={onClose} className={buttonClasses("ink", "lg", "mt-8")}>
            Voir la carte
          </Link>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 divide-y divide-rule overflow-y-auto overscroll-contain px-6">
            {checked.lines.map(({ line, details, lineTotalCents, error }) => (
              <li key={line.key} className={cn("flex gap-4 py-5", error && "opacity-90")}>
                <div className="relative size-20 shrink-0 overflow-hidden bg-sand">
                  {line.image ? <Image src={line.image.src} alt="" fill sizes="80px" className="object-cover" /> : <PhotoPlaceholder name={line.name} className="size-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-serif text-lg leading-tight">{line.name}</p>
                    <p className="shrink-0 font-semibold tabular-nums">{formatPrice(lineTotalCents)}</p>
                  </div>
                  {details.length > 0 && <p className="mt-1 text-[0.82rem] leading-snug text-sub">{details.join(" · ")}</p>}
                  {error && <p className="mt-1 text-[0.82rem] font-semibold text-danger">{error}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    <Quantity size="sm" value={line.quantity} onChange={(q) => useCart.getState().setQuantity(line.key, q)} label={`Quantité de ${line.name}`} />
                    {products.get(line.productId) && (
                      <button type="button" onClick={() => useUi.getState().openProduct(line.productId, line.key)} className="inline-flex h-10 items-center gap-1.5 px-3 text-xs font-semibold text-sub hover:text-fg">
                        <Pencil className="size-3.5" aria-hidden /> Modifier
                      </button>
                    )}
                    <button type="button" onClick={() => useCart.getState().remove(line.key)} className="inline-flex h-10 items-center gap-1.5 px-3 text-xs font-semibold text-sub hover:text-danger" aria-label={`Supprimer ${line.name}`}>
                      <Trash2 className="size-3.5" aria-hidden /> Supprimer
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
                <dt>Retrait au restaurant</dt>
                <dd>Gratuit</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="kicker">Total</dt>
                <dd className="font-serif text-3xl tabular-nums">{formatPrice(checked.subtotalCents)}</dd>
              </div>
            </dl>
            {checked.hasErrors && <p className="mt-3 text-sm font-semibold text-danger">Retirez ou modifiez les produits signalés pour continuer.</p>}
            {belowMin && <p className="mt-3 text-sm text-sub">Minimum de commande : {formatPrice(store.minOrderCents)}.</p>}
            <Link
              href="/checkout"
              onClick={onClose}
              aria-disabled={checked.hasErrors || belowMin || undefined}
              className={buttonClasses("ink", "xl", "mt-5 w-full")}
            >
              Valider ma commande
            </Link>
          </div>
        </>
      )}
    </Sheet>
  );
}
