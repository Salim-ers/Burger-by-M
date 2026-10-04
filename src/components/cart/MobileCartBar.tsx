"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { checkCart } from "@/features/cart/lines";
import { useSite } from "@/features/site-context";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatPrice } from "@/lib/money";
import { useOrderingNotice, ORDERING_CLOSED_LABEL } from "@/features/store/use-status";
import { cn } from "@/lib/utils";

/**
 * Barre collante mobile : « VOIR LE PANIER — 24,80 € » quand le panier existe,
 * sinon « COMMANDER » toujours accessible (sauf sur la carte, déjà affichée ; sur l'accueil, une fois le hero passé,
 * qui a déjà ses propres boutons).
 */
export function MobileCartBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { products } = useSite();
  const notice = useOrderingNotice();
  const count = hydrated ? cartCount(lines) : 0;
  const hidden = pathname.startsWith("/checkout") || pathname.startsWith("/commande/") || pathname.startsWith("/legal");
  const mode = hidden || !hydrated ? null : count > 0 ? "cart" : pathname === "/menu" ? null : "order";
  const total = count > 0 ? checkCart(lines, products).subtotalCents : 0;
  const pastHero = usePastHero(pathname === "/");
  const visible = mode === "order" && pathname === "/" && !pastHero ? null : mode;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
        >
          {visible === "cart" ? (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Voir le panier (${count} article${count > 1 ? "s" : ""}) — ${formatPrice(total)}`}
              className="t-label flex h-14 w-full items-center justify-between bg-ink px-5 text-cream shadow-lift"
            >
              <span>
                Panier · <span className="tabular-nums">{count}</span>
              </span>
              <span className="text-[0.85rem] tabular-nums text-cheddar">{formatPrice(total)}</span>
            </button>
          ) : (
            <Link href="/menu" className={cn("t-label flex h-14 w-full items-center justify-center shadow-lift", notice ? "bg-charcoal text-cream/70" : "bg-cheddar text-ink")}>
              {notice ? ORDERING_CLOSED_LABEL : "Commander"}
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** true une fois le hero de l'accueil (≈ un écran) dépassé. */
function usePastHero(active: boolean) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (!active) return;
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active]);
  return active && past;
}
