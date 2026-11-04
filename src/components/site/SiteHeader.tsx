"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { lockSmoothScroll } from "@/components/motion/MotionProvider";
import { useCart, useUi, cartCount } from "@/features/cart/store";
import { useSite } from "@/features/site-context";
import { useOpeningStatus, useOrderingNotice } from "@/features/store/use-status";
import { useHydrated } from "@/hooks/use-hydrated";
import { brand } from "@/data/brand";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

const isActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Liens du bureau : un seul halo repose sur la page courante, glisse vers le lien survolé et revient.
 * Rien d'autre : pas de soulignement, pas de décoration.
 */
function DesktopLinks({ pathname }: { pathname: string }) {
  const list = useRef<HTMLUListElement>(null);
  const [halo, setHalo] = useState<{ x: number; w: number } | null>(null);

  const moveTo = useCallback((el: HTMLElement | null) => {
    const item = el?.closest("li");
    setHalo(item ? { x: item.offsetLeft, w: item.offsetWidth } : null);
  }, []);
  const rest = useCallback(() => {
    moveTo(list.current?.querySelector<HTMLElement>("[aria-current=page]") ?? null);
  }, [moveTo]);

  useIsoLayoutEffect(() => {
    rest();
    // Les polices et le changement de taille de la barre déplacent les liens.
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(rest);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pathname, rest]);

  return (
    <ul ref={list} onPointerLeave={rest} onBlur={rest} className="relative hidden items-center lg:flex">
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 rounded-full bg-white/[0.09] transition-[transform,width,opacity] duration-500 ease-[var(--ease-food)]", halo ? "opacity-100" : "opacity-0")}
        style={halo ? { width: halo.w, transform: `translateX(${halo.x}px)` } : undefined}
      />
      {mainNav.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onPointerEnter={(e) => moveTo(e.currentTarget)}
              onFocus={(e) => moveTo(e.currentTarget)}
              className={cn("block rounded-full px-4 py-2.5 text-[0.8rem] font-semibold tracking-[0.01em] transition-colors duration-300", active ? "text-cream" : "text-cream/65 hover:text-cream")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Navigation flottante : détachée du haut de la fenêtre, toujours accessible, sombre sur toutes les pages. */
export function SiteHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const bump = useCart((s) => s.bump);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { store } = useSite();
  const status = useOpeningStatus();
  const notice = useOrderingNotice();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = hydrated ? cartCount(lines) : 0;
  const compact = scrolled || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const behind = document.querySelectorAll<HTMLElement>("main, footer");
    document.documentElement.style.overflow = "hidden";
    lockSmoothScroll(true);
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.documentElement.style.overflow = "";
      lockSmoothScroll(false);
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const statusLabel = status.ready ? (status.isOpen ? "Ouvert" : "Fermé") : null;

  return (
    <>
      <header data-nav className={cn("pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 transition-[padding] duration-500 ease-[var(--ease-food)]", scrolled ? "pt-2.5" : "pt-3 md:pt-5")}>
        <nav
          aria-label="Navigation principale"
          className={cn(
            "on-dark pointer-events-auto flex w-full items-center justify-between rounded-full border border-white/10 pr-1.5 pl-1.5 text-cream backdrop-blur-xl backdrop-saturate-150 lg:grid lg:grid-cols-[1fr_auto_1fr]",
            "shadow-[0_18px_50px_-18px_rgb(0_0_0/0.65),inset_0_1px_0_rgb(255_255_255/0.08)] transition-[max-width,height,background-color] duration-500 ease-[var(--ease-food)]",
            compact ? "h-14 max-w-[60rem]" : "h-[3.75rem] max-w-[68rem]",
            pathname !== "/" ? "bg-[rgb(18_14_11/0.93)]" : compact ? "bg-[rgb(18_14_11/0.82)]" : "bg-[rgb(18_14_11/0.58)]",
          )}
        >
          <Link href="/" className="group flex w-fit shrink-0 items-center rounded-full" aria-label={`${store.name} — accueil`}>
            <Image src={brand.logo.src} alt="" width={48} height={48} preload sizes="48px" className={cn("rounded-full transition-[width,height,transform] duration-500 ease-[var(--ease-food)] group-hover:rotate-[-6deg]", compact ? "size-11" : "size-12")} />
          </Link>

          <DesktopLinks pathname={pathname} />

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              data-cart-target
              onClick={() => setCartOpen(true)}
              aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
              className="relative grid size-11 place-items-center rounded-full transition-colors duration-300 hover:bg-white/[0.09]"
            >
              <ShoppingBag aria-hidden className="size-[1.15rem]" strokeWidth={1.75} />
              {count > 0 && (
                <span key={bump} className="absolute top-0.5 right-0.5 grid h-[1.15rem] min-w-[1.15rem] animate-[cart-bump_0.5s_var(--ease-food)] place-items-center rounded-full bg-cheddar px-1 text-[0.62rem] font-bold text-ink tabular-nums">
                  {count}
                </span>
              )}
            </button>

            <Link
              href="/menu"
              className={cn(
                "nav-cta inline-flex h-11 items-center rounded-full px-4 text-[0.74rem] font-bold tracking-[0.02em] transition-colors duration-300 sm:px-5",
                notice ? "border border-white/20 text-cream/70 hover:text-cream" : "bg-cheddar text-ink hover:bg-cream",
              )}
            >
              {notice ? (
                <>
                  <span className="sm:hidden">La carte</span>
                  <span className="hidden sm:inline">Commandes fermées</span>
                </>
              ) : (
                "Commander"
              )}
            </Link>

            <button
              type="button"
              className="relative grid size-11 place-items-center rounded-full transition-colors duration-300 hover:bg-white/[0.09] lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden className={cn("absolute h-[1.5px] w-5 rounded-full bg-current transition-transform duration-500 ease-[var(--ease-food)]", menuOpen ? "rotate-45" : "-translate-y-[3.5px]")} />
              <span aria-hidden className={cn("absolute h-[1.5px] w-5 rounded-full bg-current transition-transform duration-500 ease-[var(--ease-food)]", menuOpen ? "-rotate-45" : "translate-y-[3.5px]")} />
            </button>
          </div>
        </nav>
      </header>

      <div id="menu-mobile" inert={!menuOpen} data-open={menuOpen} data-lenis-prevent className="nav-sheet on-dark fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#0d0a08] px-5 pt-24 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
        <ul className="flex flex-col">
          {mainNav.map((item, i) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={item.href} className="nav-sheet-item" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-14 items-center font-display text-[clamp(2.4rem,min(12.5vw,8.6svh),4rem)] leading-none uppercase transition-colors duration-300", active ? "text-cream" : "text-cream/55 active:text-cream")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nav-sheet-item mt-auto space-y-4 pt-6" style={{ "--i": mainNav.length } as React.CSSProperties}>
          <div className="space-y-1.5 text-[0.95rem] text-cream/60">
            {statusLabel && (
              <p className="font-semibold text-cream">
                {statusLabel}
                {store.prepMinutes !== null && !notice && <span className="font-normal text-cream/60"> · retrait en {store.prepMinutes} min environ</span>}
              </p>
            )}
            <p>
              {store.street}, {store.postalCode} {store.city}
            </p>
            <a href={store.phoneHref} className="inline-flex min-h-11 items-center font-semibold text-cream">
              {store.phone}
            </a>
          </div>
          <Link
            href="/menu"
            onClick={() => setMenuOpen(false)}
            className={cn("flex h-14 items-center justify-center rounded-full text-[0.95rem] font-bold", notice ? "border border-white/20 text-cream/70" : "bg-cheddar text-ink")}
          >
            {notice ? "Commandes temporairement fermées" : "Commander"}
          </Link>
        </div>
      </div>
    </>
  );
}
