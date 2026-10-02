"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu as MenuIcon, ShoppingBag, X, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { useCartStore } from "@/stores/cart-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCount } from "@/lib/order";
import { mainNav } from "@/data/navigation";
import { fullAddress, restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const bump = useCartStore((s) => s.bump);
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className={cn("scheme-light sticky top-0 z-50 border-b bg-cream/95 backdrop-blur-sm transition-colors duration-200", scrolled || menuOpen ? "border-line" : "border-transparent")}>
        <nav aria-label="Navigation principale" className="shell flex h-16 items-center gap-4 md:h-[72px]">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${restaurant.name} — accueil`}>
            <Logo size={44} priority />
            <span className="hidden text-[0.95rem] font-bold tracking-tight sm:inline lg:hidden xl:inline">Burger By M</span>
          </Link>

          <ul className="mx-auto hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("relative block px-4 py-2 text-[0.95rem] font-medium transition-colors", active ? "text-ink" : "text-ink/65 hover:text-ink")}
                  >
                    {item.label}
                    {active && <span aria-hidden className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-ink" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <Link href="/panier" className="relative grid size-11 place-items-center rounded-full transition-colors hover:bg-ink/5" aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}>
              <ShoppingBag className="size-[22px]" aria-hidden />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={bump}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: [1.25, 1] }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.68rem] font-bold text-white tabular-nums"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <ButtonLink href="/commander" variant="dark" size="sm" className="hidden px-5 sm:inline-flex">
              Commander
            </ButtonLink>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full hover:bg-ink/5 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-6" aria-hidden /> : <MenuIcon className="size-6" aria-hidden />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="scheme-light fixed inset-x-0 top-16 bottom-0 z-[45] flex flex-col overflow-y-auto bg-cream px-4 pt-2 pb-8 lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="divide-y divide-line border-b border-line">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="flex min-h-14 items-center text-lg font-semibold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-3 text-[0.95rem] text-muted">
              <OpeningStatus />
              <a href={restaurant.phone.href} className="flex items-center gap-2 font-semibold text-ink">
                <Phone className="size-4" aria-hidden /> {restaurant.phone.display}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {fullAddress}
              </p>
            </div>
            <div className="mt-auto grid gap-2 pt-8">
              <ButtonLink href="/menu" variant="outline" size="lg">
                Voir la carte
              </ButtonLink>
              <ButtonLink href="/commander" variant="dark" size="lg">
                Commander
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
