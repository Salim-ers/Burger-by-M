"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChefHat, Clock, ExternalLink, LayoutDashboard, LogOut, Menu as MenuIcon, ReceiptText, Settings, UtensilsCrossed, X } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Logo, Wordmark } from "@/components/brand/Logo";
import { AdminNotices } from "./ui";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/cuisine", label: "Cuisine", icon: ChefHat },
  { href: "/admin/orders", label: "Commandes", icon: ReceiptText },
  { href: "/admin/menu", label: "Carte", icon: UtensilsCrossed },
  { href: "/admin/hours", label: "Horaires", icon: Clock, owner: true },
  { href: "/admin/settings", label: "Réglages", icon: Settings, owner: true },
] as const;

export function AdminShell({ user, children }: { user: { name: string; email: string; role: "owner" | "staff" }; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav aria-label="Administration" className="flex flex-col gap-1">
      {NAV.filter((n) => !("owner" in n) || user.role === "owner").map((n) => {
        const active = "exact" in n ? pathname === n.href : pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn("flex h-12 items-center gap-3 px-3 text-[0.8rem] font-semibold tracking-[0.06em] transition-colors", active ? "bg-fg/[0.08] text-fg" : "text-fg/60 hover:bg-fg/[0.04] hover:text-fg")}
          >
            <Icon className={cn("size-[18px]", active && "text-cheddar")} strokeWidth={1.6} aria-hidden />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-3 border-t border-rule pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-2 px-3 text-xs text-sub hover:text-fg">
        <ExternalLink className="size-3.5" aria-hidden /> Voir le site
      </Link>
      <div className="px-3">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-sub">
          {user.role === "owner" ? "Gérant" : "Équipe"} · {user.email}
        </p>
      </div>
      <button type="button" onClick={logout} className="flex h-10 w-full items-center gap-2 px-3 text-xs font-semibold text-sub hover:text-fg">
        <LogOut className="size-4" aria-hidden /> Se déconnecter
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between border-r border-rule bg-ink px-3 py-5 lg:flex">
        <div>
          <Link href="/admin" className="mb-8 flex items-center gap-3 px-2">
            <Logo size={40} />
            <Wordmark className="text-[1rem]" />
          </Link>
          {nav}
        </div>
        {footer}
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-rule bg-ink/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="t-label">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" aria-expanded={open} className="grid size-11 place-items-center">
          <MenuIcon className="size-5" aria-hidden />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Fermer le menu" />
          <div className="relative ml-auto flex h-full w-[min(84vw,300px)] flex-col justify-between bg-ink px-3 py-4">
            <div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="mb-4 ml-auto grid size-11 place-items-center">
                <X className="size-5" aria-hidden />
              </button>
              {nav}
            </div>
            {footer}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
      <AdminNotices />
    </div>
  );
}
