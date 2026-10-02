"use client";

import Link from "next/link";
import { Bell, BellRing, PackageX, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import { timeAgo } from "@/lib/admin";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/types/order";

const ICONS: Record<NotificationKind, typeof Bell> = { new_order: BellRing, order_cancelled: XCircle, order_ready: CheckCircle2, product_unavailable: PackageX };

export default function NotificationsPage() {
  const notifications = useAdminStore((s) => s.notifications);
  const markAllRead = useAdminStore((s) => s.markAllRead);
  return (
    <>
      <PageHeader
        title="Notifications"
        text="Nouvelles commandes, annulations, commandes prêtes et ruptures. Prévu en production : notifications push, email ou SMS."
        actions={
          notifications.length > 0 ? (
            <Button variant="outline-light" size="sm" onClick={markAllRead}>
              Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />
      {notifications.length === 0 ? (
        <p className="rounded-sm border border-dashed border-cream/15 p-12 text-center text-cream/50">Aucune notification. Les événements du service apparaîtront ici.</p>
      ) : (
        <ul className="divide-y divide-cream/10 rounded-sm border border-cream/10">
          {notifications.map((n) => {
            const Icon = ICONS[n.kind];
            const body = (
              <>
                <Icon className={cn("mt-0.5 size-5 shrink-0", n.kind === "new_order" ? "text-rose" : n.kind === "order_ready" ? "text-success" : "text-[#ff9b94]")} aria-hidden />
                <span className="flex-1">
                  <span className="block font-semibold">{n.title}</span>
                  <span className="block text-sm text-cream/60">{n.body}</span>
                </span>
                <span className="text-xs text-cream/40">{timeAgo(n.createdAt)}</span>
              </>
            );
            return (
              <li key={n.id} className={cn(!n.read && "bg-rose/5")}>
                {n.orderId ? (
                  <Link href={`/admin/commandes/${n.orderId}`} className="flex items-start gap-4 px-4 py-4 hover:bg-cream/[0.02]">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-start gap-4 px-4 py-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
