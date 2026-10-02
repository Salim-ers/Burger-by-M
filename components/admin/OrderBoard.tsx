"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import type { Order } from "@/types/order";
import { OrderCard } from "./OrderCard";
import { AcceptDialog } from "./AcceptDialog";
import { useAdminStore } from "@/stores/admin-store";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "new", title: "Nouvelles", statuses: ["PENDING"] },
  { id: "prep", title: "En préparation", statuses: ["ACCEPTED", "PREPARING"] },
  { id: "ready", title: "Prêtes", statuses: ["READY"] },
] as const;

/** Tableau 3 colonnes (Nouvelles / En préparation / Prêtes) — partagé par Commandes et Kitchen. */
export function OrderBoard({ large }: { large?: boolean }) {
  const orders = useAdminStore((s) => s.orders);
  const [accepting, setAccepting] = useState<Order | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const active = orders.filter((o) => ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status));

  if (active.length === 0) {
    return (
      <div className="grid min-h-[40vh] place-items-center rounded-lg border border-dashed border-edge text-center">
        <div>
          <p className="text-2xl font-bold">Aucune commande en cours</p>
          <p className="mt-4 text-sm text-cream/55">Les nouvelles commandes apparaîtront ici automatiquement.</p>
        </div>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className="grid gap-3 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = active
            .filter((o) => (col.statuses as readonly string[]).includes(o.status))
            .sort((a, b) => new Date(a.pickup.time).getTime() - new Date(b.pickup.time).getTime());
          return (
            <section key={col.id} aria-labelledby={`col-${col.id}`} className="min-w-0">
              <h2 id={`col-${col.id}`} className="flex items-center justify-between rounded-t-lg border border-b-0 border-edge bg-panel px-3 py-3 text-base font-bold">
                {col.title}
                <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[0.72rem] font-bold tabular-nums", col.id === "new" && list.length ? "bg-cream text-ink" : "bg-white/[0.06] text-cream/70")}>{list.length}</span>
              </h2>
              <div className="space-y-2 rounded-b-lg border border-edge bg-white/[0.015] p-2 lg:min-h-[50vh]">
                <AnimatePresence mode="popLayout">
                  {list.map((o) => (
                    <OrderCard key={o.id} order={o} onAccept={setAccepting} large={large} now={now} />
                  ))}
                </AnimatePresence>
                {list.length === 0 && <p className="py-10 text-center text-sm text-cream/35">Rien ici.</p>}
              </div>
            </section>
          );
        })}
      </div>
      <AcceptDialog order={accepting} onClose={() => setAccepting(null)} />
    </LayoutGroup>
  );
}
