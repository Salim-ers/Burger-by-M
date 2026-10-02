"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { CartItemRow } from "./CartItemRow";
import { PickupSummary } from "./PickupSummary";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { cartCount, cartSubtotal } from "@/lib/order";

export function CartDrawer() {
  const router = useRouter();
  const open = useUiStore((s) => s.cartOpen);
  const setOpen = useUiStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const count = cartCount(items);

  return (
    <Dialog open={open} onClose={onClose} labelledBy="cart-title" placement="side">
      <div className="flex items-baseline gap-3 border-b border-graphite px-5 pt-6 pb-4 md:pt-8">
        <h2 id="cart-title" className="font-display text-5xl leading-none">
          Panier
        </h2>
        <span className="font-display text-2xl text-cheddar tabular-nums">({count})</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center px-5 pb-16">
          <p className="font-display text-d3">
            Ton panier
            <br />a faim<span className="text-cheddar">.</span>
          </p>
          <Button variant="primary" size="lg" arrow className="mt-8 self-start" onClick={() => go("/commander")}>
            Voir la carte
          </Button>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-graphite overflow-y-auto overscroll-contain px-5">
            {items.map((item) => (
              <CartItemRow key={item.lineId} item={item} />
            ))}
          </ul>
          <div className="border-t border-graphite px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <PickupSummary className="text-sm text-bone/60" />
            <div className="mt-3 flex items-baseline justify-between">
              <span className="kicker">Total</span>
              <span className="font-display text-4xl tabular-nums">
                <Price cents={cartSubtotal(items)} />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-2">
              <Button variant="outline" size="lg" onClick={() => go("/panier")}>
                Panier
              </Button>
              <Button variant="primary" size="lg" arrow onClick={() => go("/checkout")}>
                Commander
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
