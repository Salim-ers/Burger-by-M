"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, CalendarClock, ChefHat, ClipboardList, LayoutDashboard, LogOut, Menu as MenuIcon, PackageX, Percent,
  Settings, Shapes, UtensilsCrossed, Volume2, VolumeX, X, Zap, BookOpen, ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { OrderToasts } from "./OrderToasts";
import { useAdminStore } from "@/stores/admin-store";
import { useAdminHydrated } from "@/hooks/use-admin-hydrated";
import { SHOW_DEV_TOOLS, DEMO_MODE } from "@/config/demo";
import { timeAgo } from "@/lib/admin";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Commandes", icon: ClipboardList, badge: true },
  { href: "/admin/kitchen", label: "Cuisine", icon: ChefHat },
  { href: "/admin/menu", label: "La carte", icon: BookOpen },
  { href: "/admin/produits", label: "Produits", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Catégories", icon: Shapes },
  { href: "/admin/disponibilites", label: "Disponibilités", icon: PackageX },
  { href: "/admin/horaires", label: "Horaires", icon: CalendarClock },
  { href: "/admin/promotions", label: "Promotions", icon: Percent },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useAdminHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const session = useAdminStore((s) => s.session);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (hydrated && !session) router.replace("/admin/login");
  }, [hydrated, session, router]);
  useEffect(() => setDrawer(false), [pathname]);

  if (!hydrated || !session) {
    return <div className="grid min-h-dvh place-items-center text-sm text-cream/50">Chargement…</div>;
  }

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-cream/10 bg-ink-warm lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation du back-office"
              className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-ink-warm"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" onClick={() => setDrawer(false)} aria-label="Fermer la navigation" className="absolute top-3 right-3 grid size-11 place-items-center rounded-full hover:bg-cream/10">
                <X className="size-5" aria-hidden />
              </button>
              <SidebarContent pathname={pathname} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="min-w-0">
        <TopBar onMenu={() => setDrawer(true)} />
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <OrderToasts />
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  const pending = useAdminStore((s) => s.orders.filter((o) => o.status === "PENDING").length);
  const session = useAdminStore((s) => s.session);
  const logout = useAdminStore((s) => s.logout);
  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5 pb-6">
        <Logo size={44} />
        <div>
          <p className="font-display text-xl leading-none uppercase">By M</p>
          <p className="text-xs text-cream/50">Back-office</p>
        </div>
      </div>
      <nav aria-label="Back-office" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors", active ? "bg-cream text-ink" : "text-cream/70 hover:bg-cream/5 hover:text-cream")}
                >
                  <Icon className="size-4.5 shrink-0" aria-hidden />
                  <span className="flex-1">{label}</span>
                  {badge && pending > 0 && <span className="grid size-5 place-items-center rounded-full bg-rose text-[0.65rem] font-bold text-ink">{pending}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-2 border-t border-cream/10 p-4 text-xs text-cream/50">
        <Link href="/" target="_blank" className="flex items-center gap-2 hover:text-cream">
          <ExternalLink className="size-3.5" aria-hidden /> Voir le site
        </Link>
        <p className="truncate">{session?.email}</p>
        <button type="button" onClick={logout} className="flex items-center gap-2 hover:text-cream">
          <LogOut className="size-3.5" aria-hidden /> Déconnexion
        </button>
      </div>
    </>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const settings = useAdminStore((s) => s.settings);
  const setSetting = useAdminStore((s) => s.setSetting);
  const simulate = useAdminStore((s) => s.simulateOrder);

  return (
    <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center gap-2 border-b border-cream/10 bg-ink/90 px-4 py-2 backdrop-blur-[6px] md:px-8">
      <button type="button" onClick={onMenu} aria-label="Ouvrir la navigation" className="grid size-11 place-items-center rounded-full hover:bg-cream/10 lg:hidden">
        <MenuIcon className="size-5" aria-hidden />
      </button>
      {DEMO_MODE && <Badge tone="cheddar">Mode démonstration</Badge>}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className={cn("hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex", settings.acceptingOrders ? "bg-success/15 text-success" : "bg-danger/15 text-[#ff9b94]")}>
          <span className={cn("size-2 rounded-full", settings.acceptingOrders ? "bg-success" : "bg-danger")} />
          {settings.acceptingOrders ? "Commandes ouvertes" : "Commandes fermées"}
        </span>
        {settings.rushMode && (
          <span className="hidden items-center gap-1.5 rounded-full bg-cheddar/20 px-3 py-1.5 text-xs font-semibold text-cheddar sm:inline-flex">
            <Zap className="size-3.5" aria-hidden /> Coup de feu
          </span>
        )}
        {SHOW_DEV_TOOLS && (
          <button type="button" onClick={() => simulate()} className="h-10 rounded-full border border-dashed border-rose/60 px-4 text-[0.7rem] font-bold tracking-wider text-rose uppercase hover:bg-rose/10">
            Simuler une nouvelle commande
          </button>
        )}
        <button
          type="button"
          onClick={() => setSetting("soundEnabled", !settings.soundEnabled)}
          aria-pressed={settings.soundEnabled}
          aria-label={settings.soundEnabled ? "Couper le son des alertes" : "Activer le son des alertes"}
          className="grid size-10 place-items-center rounded-full hover:bg-cream/10"
        >
          {settings.soundEnabled ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5 text-cream/50" aria-hidden />}
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}

function NotificationBell() {
  const notifications = useAdminStore((s) => s.notifications);
  const markAllRead = useAdminStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Notifications, ${unread} non lue${unread > 1 ? "s" : ""}`}
        className="relative grid size-10 place-items-center rounded-full hover:bg-cream/10"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && <span className="absolute top-1 right-1 grid min-w-4.5 place-items-center rounded-full bg-rose px-1 text-[0.6rem] font-bold text-ink">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-sm border border-cream/10 bg-ink-warm shadow-panel"
          >
            <div className="flex items-center justify-between border-b border-cream/10 px-4 py-3">
              <p className="text-sm font-bold">Notifications</p>
              <button type="button" onClick={markAllRead} className="text-xs text-cream/60 hover:text-cream">
                Tout marquer comme lu
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && <li className="px-4 py-8 text-center text-sm text-cream/45">Aucune notification.</li>}
              {notifications.slice(0, 12).map((n) => (
                <li key={n.id} className={cn("border-b border-cream/5 px-4 py-3 text-sm", !n.read && "bg-rose/5")}>
                  {n.orderId ? (
                    <Link href={`/admin/commandes/${n.orderId}`} onClick={() => setOpen(false)} className="block hover:text-rose">
                      <span className="font-semibold">{n.title}</span>
                      <span className="block text-xs text-cream/55">{n.body}</span>
                    </Link>
                  ) : (
                    <>
                      <span className="font-semibold">{n.title}</span>
                      <span className="block text-xs text-cream/55">{n.body}</span>
                    </>
                  )}
                  <span className="text-[0.68rem] text-cream/35">{timeAgo(n.createdAt)}</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/notifications" onClick={() => setOpen(false)} className="block px-4 py-3 text-center text-xs font-semibold text-cream/70 hover:text-cream">
              Tout voir
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
