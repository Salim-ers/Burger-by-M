"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { OrderBoard } from "@/components/admin/OrderBoard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminStore } from "@/stores/admin-store";
import { formatPrice } from "@/lib/currency";
import { formatDayTime } from "@/lib/hours";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [tab, setTab] = useState<"live" | "history">("live");
  const orders = useAdminStore((s) => s.orders);
  const history = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

  return (
    <>
      <PageHeader
        title="Commandes"
        text="Les nouvelles commandes arrivent en temps réel (démo : depuis le site ouvert dans un autre onglet, ou via le bouton de simulation)."
        actions={
          <div role="tablist" aria-label="Vue" className="inline-flex rounded-full border border-cream/15 p-1">
            {(["live", "history"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                type="button"
                onClick={() => setTab(t)}
                className={cn("h-10 rounded-full px-4 text-xs font-bold uppercase", tab === t ? "bg-cream text-ink" : "text-cream/60")}
              >
                {t === "live" ? "En cours" : "Historique"}
              </button>
            ))}
          </div>
        }
      />
      {tab === "live" ? (
        <OrderBoard />
      ) : history.length === 0 ? (
        <p className="py-16 text-center text-cream/50">Aucune commande terminée pour le moment.</p>
      ) : (
        <ul className="divide-y divide-cream/10 rounded-sm border border-cream/10">
          {history.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/commandes/${o.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 hover:bg-cream/[0.02]">
                <span className="text-xl font-extrabold tabular-nums">#{o.number.replace("BYM-", "")}</span>
                <span className="flex-1">{o.customer.firstName}</span>
                <span className="text-sm text-cream/60">{formatDayTime(o.pickup.time)}</span>
                <span className="tabular-nums">{formatPrice(o.total)}</span>
                <StatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
