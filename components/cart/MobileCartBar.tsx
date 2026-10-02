"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount, cartSubtotal } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

const VISIBLE_ON = ["/", "/menu", "/commander", "/restaurant", "/contact"];

/**
 * Barre collante mobile.
 * Panier rempli → « PANIER (3) · 27,80 € » ; panier vide → CTA « COMMANDER » (après le premier écran).
 */
export function MobileCartBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const [scrolled, setScrolled] = useState(false);
  const count = hydrated ? cartCount(items) : 0;
  const allowed = VISIBLE_ON.includes(pathname) || pathname.startsWith("/menu/");

  const [ctaInView, setCtaInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pas de doublon : la barre « Commander » s'efface quand un grand CTA de la page est visible.
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll("[data-hide-order-bar]"));
    if (targets.length === 0) return setCtaInView(false);
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setCtaInView(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  const mode = !allowed ? null : count > 0 ? "cart" : scrolled && !ctaInView && pathname !== "/commander" ? "order" : null;

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {mode === "cart" ? (
            <button type="button" onClick={() => setCartOpen(true)} className="flex h-14 w-full items-center justify-between rounded-sm bg-cheddar px-4 font-display text-xl text-ink uppercase shadow-float">
              <span>
                Panier <span className="tabular-nums">({count})</span>
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                {formatPrice(cartSubtotal(items))} <ArrowRight className="size-5" aria-hidden />
              </span>
            </button>
          ) : (
            <Link href="/commander" className="flex h-14 w-full items-center justify-between rounded-sm bg-cheddar px-4 font-display text-xl text-ink uppercase shadow-float">
              Commander <ArrowRight className="size-5" aria-hidden />
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
