"use client";

import { Price } from "@/components/ui/Price";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { BagLineArt } from "@/components/ui/LineArt";
import { CartItemRow } from "./CartItemRow";
import { PickupSummary } from "./PickupSummary";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

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
      <div className="flex items-baseline gap-3 px-6 pt-7 pb-4 md:pt-9">
        <h2 id="cart-title" className="font-display text-4xl uppercase">
          Ton panier
        </h2>
        <span className="text-sm text-cream/55 tabular-nums">
          {count} article{count > 1 ? "s" : ""}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <BagLineArt className="w-28 text-rose" />
          <p className="mt-6 font-display text-4xl leading-none uppercase">
            Ton panier
            <br />a faim.
          </p>
          <Button variant="cream" size="lg" arrow className="mt-8" onClick={() => go("/menu")}>
            Découvrir la carte
          </Button>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-cream/10 overflow-y-auto overscroll-contain px-6">
            {items.map((item) => (
              <CartItemRow key={item.lineId} item={item} />
            ))}
          </ul>
          <div className="border-t border-cream/10 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <PickupSummary className="text-sm text-cream/65" />
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm font-semibold tracking-wide uppercase">Total</span>
              <span className="font-display text-3xl tabular-nums"><Price cents={cartSubtotal(items)} /></span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline-light" onClick={() => go("/panier")}>
                Voir le panier
              </Button>
              <Button variant="rose" arrow onClick={() => go("/checkout")}>
                Commander
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
