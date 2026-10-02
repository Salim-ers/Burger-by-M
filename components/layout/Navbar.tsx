"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { cartCount } from "@/lib/order";
import { mainNav } from "@/data/navigation";
import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const bump = useCartStore((s) => s.bump);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,height,backdrop-filter] duration-500 ease-out-expo",
          scrolled || menuOpen ? "h-16 bg-ink/85 backdrop-blur-[6px]" : "h-20 md:h-24",
        )}
      >
        <nav aria-label="Navigation principale" className="container-site flex h-full items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${restaurant.name} — accueil`}>
            <Logo size={scrolled ? 40 : 52} priority className="transition-[width,height] duration-500" />
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {mainNav.map((item) => {
              const active = item.href === pathname;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative py-2 text-[0.82rem] font-semibold tracking-wide text-cream/85 transition-colors hover:text-cream"
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-rose transition-transform duration-500 ease-out-expo",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              data-cart-target
              onClick={() => setCartOpen(true)}
              aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
              className="flex h-11 items-center gap-2 rounded-full px-3 text-[0.8rem] font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              <motion.span key={bump} animate={bump ? { scale: [1, 1.25, 1] } : undefined} transition={{ duration: 0.45 }} className="relative">
                <ShoppingBag className="size-5" aria-hidden />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 grid size-4.5 place-items-center rounded-full bg-rose text-[0.6rem] font-bold text-ink md:hidden">
                    {count}
                  </span>
                )}
              </motion.span>
              <span className="hidden md:inline">
                Panier <span className="text-rose">·</span> <span className="tabular-nums">{count}</span>
              </span>
            </button>
            <ButtonLink href="/commander" variant="rose" size="sm" arrow className="hidden sm:inline-flex">
              Commander
            </ButtonLink>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-cream hover:bg-cream/10 lg:hidden"
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
            className="fixed inset-0 z-40 flex flex-col bg-ink px-6 pt-24 pb-10 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-1 flex-col justify-center gap-2">
              {[{ href: "/", label: "Accueil" }, ...mainNav, { href: "/commander", label: "Commander" }].map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={item.href} className="block py-1 font-display text-[clamp(2.6rem,12vw,4.5rem)] leading-none uppercase hover:text-rose">
                      {item.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-cream/15 pt-6 text-sm text-cream/75">
              <OpeningStatus />
              <a href={restaurant.phone.href} className="font-semibold text-cream">
                {restaurant.phone.display}
              </a>
              <span>
                {restaurant.address.street}, {restaurant.address.city}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
