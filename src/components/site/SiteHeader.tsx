"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useOpeningStatus, useOrderingNotice } from "@/features/store/use-status";
import { useHydrated } from "@/hooks/use-hydrated";
import { brand } from "@/data/brand";
import { mainNav, secondaryNav } from "@/data/navigation";
import { formatHour } from "@/lib/schedule";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

/** Thème de la section sous le header (data-theme), relu au défilement. */
function useSectionTheme(pathname: string): Theme {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      let t: Theme = "light";
      for (const el of document.querySelectorAll<HTMLElement>("[data-theme]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= 36 && r.bottom > 36) t = el.dataset.theme === "dark" ? "dark" : "light";
      }
      setTheme(t);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    const late = window.setTimeout(read, 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(late);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);
  return theme;
}

/** Header : transparent sur le hero, compact au défilement, couleur adaptée à la section survolée. */
export function SiteHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const bump = useCart((s) => s.bump);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { store } = useSite();
  const status = useOpeningStatus();
  const notice = useOrderingNotice();
  const theme = useSectionTheme(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = hydrated ? cartCount(lines) : 0;
  const dark = menuOpen || theme === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  const statusLabel = status.ready ? (status.isOpen ? "Ouvert" : "Fermé") : null;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500 ease-[var(--ease-food)]",
          dark ? "on-dark" : "on-light",
          scrolled && !menuOpen ? (dark ? "border-b border-white/10 bg-ink/72 backdrop-blur-md" : "border-b border-ink/10 bg-ivory/82 backdrop-blur-md") : "border-b border-transparent bg-transparent",
        )}
      >
        <nav aria-label="Navigation principale" className={cn("container-bm flex items-center gap-6 transition-[height] duration-500", scrolled ? "h-16" : "h-[4.5rem] md:h-24")}>
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${store.name} — accueil`}>
            <Image src={brand.logo.src} alt="" width={44} height={44} preload className={cn("rounded-full transition-[width,height] duration-500", scrolled ? "size-9" : "size-10 md:size-11")} />
            <span className="hidden text-[1.05rem] leading-none sm:inline">
              <span className="font-display tracking-[0.06em]">BURGER</span> <span className="font-serif text-[1.2rem] italic">by M</span>
            </span>
          </Link>

          <ul className="ml-auto hidden items-center gap-8 lg:flex">
            {mainNav.map((item) => {
              const active = item.href === "/menu" ? pathname.startsWith("/menu") : item.href === "/restaurant" ? pathname.startsWith("/restaurant") : false;
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className="group t-label relative py-2">
                    {item.label}
                    <span className={cn("absolute -bottom-0.5 left-0 h-px w-full origin-left bg-cheddar transition-transform duration-500 ease-[var(--ease-food)]", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            {statusLabel && (
              <p className="t-label hidden items-center gap-2 xl:flex">
                <span aria-hidden className={cn("size-1.5 rounded-full", status.ready && status.isOpen ? "bg-open" : "bg-closed")} />
                {statusLabel}
                {status.ready && status.isOpen && status.closesAt && <span className="text-sub">· jusqu’à {formatHour(status.closesAt)}</span>}
              </p>
            )}
            <button type="button" data-cart-target onClick={() => setCartOpen(true)} aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`} className="t-label relative flex h-11 items-center gap-2 px-3">
              <span className="hidden md:inline">Panier</span>
              <span key={bump} className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[0.65rem] tabular-nums", count > 0 ? "animate-[cart-bump_0.5s_var(--ease-food)] bg-cheddar text-ink" : dark ? "bg-white/12" : "bg-ink/8")}>
                {count}
              </span>
            </button>
            <Link
              href="/menu"
              className={cn(
                "t-label hidden h-11 items-center px-5 transition-colors duration-300 sm:inline-flex",
                notice ? "border border-current/30 text-sub" : dark ? "bg-cream text-ink hover:bg-cheddar" : "bg-ink text-cream hover:bg-cheddar hover:text-ink",
              )}
            >
              {notice ? "Commandes fermées" : "Commander"}
            </Link>
            <button type="button" className="relative grid size-11 place-items-center lg:hidden" aria-expanded={menuOpen} aria-controls="menu-mobile" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen((v) => !v)}>
              <span aria-hidden className={cn("absolute h-px w-6 bg-current transition-transform duration-300", menuOpen ? "rotate-45" : "-translate-y-[4px]")} />
              <span aria-hidden className={cn("absolute h-px w-6 bg-current transition-transform duration-300", menuOpen ? "-rotate-45" : "translate-y-[4px]")} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="menu-mobile"
        inert={!menuOpen}
        className={cn(
          "on-dark fixed inset-0 z-40 flex flex-col bg-ink px-[var(--gutter)] pt-28 pb-10 transition-[clip-path] duration-700 ease-[var(--ease-mask)] lg:hidden",
          menuOpen ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
      >
        <ul className="flex flex-col gap-1">
          {[{ href: "/", label: "Accueil" }, ...mainNav, ...secondaryNav].map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setMenuOpen(false)} className="t-l block py-1">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-5">
          <div className="h-px bg-white/15" />
          <p className="t-label flex items-center gap-2">
            {statusLabel && <span aria-hidden className={cn("size-1.5 rounded-full", status.ready && status.isOpen ? "bg-open" : "bg-closed")} />}
            {statusLabel}
            {store.prepMinutes !== null && !notice && <span className="text-sub">· retrait ≈ {store.prepMinutes} min</span>}
          </p>
          <p className="text-sm text-sub">
            {store.street}, {store.postalCode} {store.city}
          </p>
          <a href={store.phoneHref} className="t-m block">
            {store.phone}
          </a>
          <Link href="/menu" onClick={() => setMenuOpen(false)} className={cn("t-label flex h-14 items-center justify-center", notice ? "border border-white/25 text-sub" : "bg-cheddar text-ink")}>
            {notice ? "Commandes temporairement fermées" : "Commander"}
          </Link>
        </div>
      </div>
    </>
  );
}
