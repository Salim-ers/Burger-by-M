"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { Magnetic } from "@/components/motion/Magnetic";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount } from "@/lib/order";
import { mainNav } from "@/data/navigation";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const bump = useCartStore((s) => s.bump);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={cn(
          "scheme-dark fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,height] duration-300",
          solid ? "h-16 border-graphite bg-ink/[0.97]" : "h-20 border-transparent md:h-24",
        )}
      >
        <nav aria-label="Navigation principale" className="shell flex h-full items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${restaurant.name} — accueil`}>
            <Logo size={44} priority className={cn("transition-transform duration-300", solid ? "scale-[0.86]" : "scale-100")} />
          </Link>

          <ul className="ml-4 hidden items-center gap-8 lg:flex">
            {mainNav.map((item) => {
              const active = item.href === pathname;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative block overflow-hidden py-1 font-display text-[1.05rem] leading-none tracking-[0.04em] text-bone/80 transition-colors hover:text-bone"
                  >
                    <span className="block transition-transform duration-300 ease-out-expo group-hover:-translate-y-full">{item.label}</span>
                    <span aria-hidden className="absolute inset-x-0 top-full block py-1 text-cheddar transition-transform duration-300 ease-out-expo group-hover:-translate-y-full">
                      {item.label}
                    </span>
                    {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-cheddar" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1 md:gap-4">
            <button
              type="button"
              data-cart-target
              onClick={() => setCartOpen(true)}
              aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
              className="flex h-11 items-center gap-1.5 px-2 font-display text-[1.05rem] leading-none tracking-[0.04em] text-bone transition-colors hover:text-cheddar"
            >
              <span>Panier</span>
              <motion.span key={bump} animate={bump ? { scale: [1, 1.18, 1] } : undefined} transition={{ duration: 0.4 }} className={cn("inline-flex items-center", count > 0 && "text-cheddar")}>
                (<RollingNumber value={count} pad={1} />)
              </motion.span>
            </button>
            <Magnetic className="hidden sm:inline-flex">
              <ButtonLink href="/commander" variant="primary" size="sm" arrow>
                Commander
              </ButtonLink>
            </Magnetic>
            <button
              type="button"
              className="relative grid size-11 place-items-center lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden className={cn("absolute h-0.5 w-6 bg-bone transition-transform duration-300", menuOpen ? "rotate-45" : "-translate-y-1")} />
              <span aria-hidden className={cn("absolute h-0.5 w-6 bg-bone transition-transform duration-300", menuOpen ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="scheme-dark fixed inset-0 z-[45] flex flex-col bg-ink px-4 pt-24 pb-8 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-1 flex-col justify-center gap-1">
              {[{ href: "/", label: "Accueil" }, ...mainNav].map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-graphite">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={item.href} className="flex items-baseline justify-between py-2 font-display text-[clamp(3rem,15vw,5rem)] leading-[0.95] active:text-cheddar">
                      {item.label}
                      <span className="font-sans text-xs font-semibold text-bone/40 tabular-nums">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-6 text-sm text-bone/70">
              <OpeningStatus />
              <a href={restaurant.phone.href} className="font-display text-2xl text-bone">
                {restaurant.phone.display}
              </a>
              <span>
                {restaurant.address.street}, {restaurant.address.postalCode} {restaurant.address.city}
              </span>
              <ButtonLink href="/commander" variant="primary" size="lg" arrow className="mt-3 w-full">
                Commander
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
