"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

const HIDDEN_ON = ["/panier", "/checkout", "/confirmation"];
/** Pages où la carte est déjà affichée : pas de bouton « Commander » si le panier est vide. */
const MENU_PAGES = ["/menu", "/commander"];

/**
 * Bouton collant mobile.
 * Panier vide → « COMMANDER » ; panier rempli → « 2 articles · 23,80 € — VOIR MON PANIER ».
 */
export function MobileOrderBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const count = hydrated ? cartCount(items) : 0;
  const hidden = HIDDEN_ON.includes(pathname) || pathname.startsWith("/legal");
  const mode = hidden || !hydrated ? null : count > 0 ? "cart" : MENU_PAGES.includes(pathname) ? null : "order";

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {mode === "cart" ? (
            <Link href="/panier" className="flex h-14 w-full items-center justify-between rounded-full bg-ink pr-2 pl-5 text-white">
              <span className="text-left leading-tight">
                <span className="block text-[0.78rem] text-white/70">
                  {count} article{count > 1 ? "s" : ""}
                </span>
                <span className="block font-bold tabular-nums">{formatPrice(cartSubtotal(items))}</span>
              </span>
              <span className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[0.8rem] font-bold tracking-[0.04em] text-ink uppercase">
                Voir mon panier <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          ) : (
            <Link href="/commander" className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.9rem] font-bold tracking-[0.06em] text-white uppercase">
              Commander <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
