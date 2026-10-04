"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useHydrated } from "@/hooks/use-hydrated";
import { mainNav, secondaryNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

/** En-tête transparent sur le hero, ivoire légèrement opaque au défilement. */
export function SiteHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const bump = useCart((s) => s.bump);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { store } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = hydrated ? cartCount(lines) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500", solid ? "border-b border-ink/10 bg-ivory/90 backdrop-blur-md" : "border-b border-transparent")}>
        <nav aria-label="Navigation principale" className="shell flex h-16 items-center gap-6 md:h-20">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${store.name} — accueil`}>
            <Logo size={40} priority />
            <span className="hidden font-serif text-[1.05rem] tracking-[0.16em] sm:inline">
              BURGER <span className="italic">by</span> M
            </span>
          </Link>

          <ul className="ml-auto hidden items-center gap-9 lg:flex">
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className="group relative py-2 text-[0.72rem] font-semibold tracking-[0.22em] uppercase">
                    {item.label}
                    <span className={cn("absolute -bottom-0.5 left-0 h-px w-full origin-left bg-brass transition-transform duration-500 ease-out-expo", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1 lg:ml-6">
            <button type="button" data-cart-target onClick={() => setCartOpen(true)} aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`} className="relative flex h-11 items-center gap-2 px-3 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
              <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden />
              <span className="hidden md:inline">Panier</span>
              <motion.span key={bump} initial={bump ? { scale: 1.6 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.62rem] font-bold tabular-nums", count > 0 ? "bg-ink text-ivory" : "bg-ink/10")}>
                {count}
              </motion.span>
            </button>
            <Link href="/menu" className={buttonClasses("ink", "sm", "hidden sm:inline-flex")}>
              Commander
            </Link>
            <button type="button" className="relative grid size-11 place-items-center lg:hidden" aria-expanded={menuOpen} aria-controls="menu-mobile" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen((v) => !v)}>
              <span aria-hidden className={cn("absolute h-px w-6 bg-ink transition-transform duration-300", menuOpen ? "rotate-45" : "-translate-y-[4px]")} />
              <span aria-hidden className={cn("absolute h-px w-6 bg-ink transition-transform duration-300", menuOpen ? "-rotate-45" : "translate-y-[4px]")} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-mobile"
            className="on-light fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ivory px-6 pt-24 pb-10 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-col gap-1">
              {[{ href: "/", label: "Accueil" }, ...mainNav, ...secondaryNav].map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={item.href} className="block py-1.5 font-serif text-[2.6rem] leading-tight">
                      {item.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-4 pt-10">
              <div className="hairline" />
              <p className="text-sm text-sub">
                {store.street}, {store.postalCode} {store.city}
              </p>
              <a href={store.phoneHref} className="block font-serif text-2xl">
                {store.phone}
              </a>
              <Link href="/menu" className={buttonClasses("ink", "xl", "w-full")}>
                Commander
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
