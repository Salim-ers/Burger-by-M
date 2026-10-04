"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { checkCart } from "@/features/cart/lines";
import { useSite } from "@/features/site-context";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatPrice } from "@/lib/money";

/**
 * Barre collante mobile : « VOIR LE PANIER — 24,80 € » quand le panier existe,
 * sinon « COMMANDER » toujours accessible (sauf sur la carte, déjà affichée).
 */
export function MobileCartBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { products } = useSite();
  const count = hydrated ? cartCount(lines) : 0;
  const hidden = pathname.startsWith("/checkout") || pathname.startsWith("/commande/") || pathname.startsWith("/legal");
  const mode = hidden || !hydrated ? null : count > 0 ? "cart" : pathname === "/menu" ? null : "order";
  const total = count > 0 ? checkCart(lines, products).subtotalCents : 0;

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {mode === "cart" ? (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Voir le panier (${count} article${count > 1 ? "s" : ""}) — ${formatPrice(total)}`}
              className="relative flex h-14 w-full items-center justify-center gap-3 rounded-xs bg-ink px-5 text-ivory shadow-lift"
            >
              <span aria-hidden className="absolute left-3 grid size-8 place-items-center rounded-full bg-ivory text-[0.72rem] font-bold text-ink tabular-nums">
                {count}
              </span>
              <span className="text-[0.74rem] font-bold tracking-[0.2em] uppercase">
                Voir le panier — <span className="tabular-nums">{formatPrice(total)}</span>
              </span>
            </button>
          ) : (
            <Link href="/menu" className="flex h-14 w-full items-center justify-center rounded-xs bg-ink text-[0.74rem] font-bold tracking-[0.22em] text-ivory uppercase shadow-lift">
              Commander
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
