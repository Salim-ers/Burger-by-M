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
      <div className="grid min-h-[50vh] place-items-center rounded-sm border border-dashed border-cream/15 text-center">
        <div>
          <p className="font-display text-5xl leading-none uppercase md:text-6xl">
            Tout est calme
            <br />
            pour l’instant.
          </p>
          <p className="mt-4 text-sm text-cream/55">Les nouvelles commandes apparaîtront ici automatiquement.</p>
        </div>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className="grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = active
            .filter((o) => (col.statuses as readonly string[]).includes(o.status))
            .sort((a, b) => new Date(a.pickup.time).getTime() - new Date(b.pickup.time).getTime());
          return (
            <section key={col.id} aria-labelledby={`col-${col.id}`} className="min-w-0">
              <h2 id={`col-${col.id}`} className="mb-3 flex items-center justify-between px-1 text-xs font-bold tracking-[0.16em] text-cream/60 uppercase">
                {col.title}
                <span className={cn("grid size-6 place-items-center rounded-full text-[0.7rem] tabular-nums", col.id === "new" && list.length ? "bg-rose text-ink" : "bg-cream/10")}>{list.length}</span>
              </h2>
              <div className="space-y-3 rounded-sm bg-cream/[0.02] p-2 lg:min-h-[60vh]">
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
