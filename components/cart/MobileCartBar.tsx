"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

const VISIBLE_ON = ["/", "/menu", "/commander", "/restaurant"];

/** Barre panier collante (mobile) : « Voir mon panier · 27,80 € ». */
export function MobileCartBar() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const count = cartCount(items);
  const visible = count > 0 && (VISIBLE_ON.includes(pathname) || pathname.startsWith("/menu/"));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex h-14 w-full items-center justify-between rounded-full bg-rose px-5 text-ink shadow-float"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold tracking-wide uppercase">
              <span className="relative">
                <ShoppingBag className="size-5" aria-hidden />
                <span className="absolute -top-1.5 -right-2 grid size-4.5 place-items-center rounded-full bg-ink text-[0.6rem] text-cream">{count}</span>
              </span>
              <span className="ml-1">Voir mon panier</span>
            </span>
            <span className="font-bold tabular-nums">{formatPrice(cartSubtotal(items))}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
