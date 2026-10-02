"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Phone, MessageSquareText } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";
import { StatusBadge } from "./StatusBadge";
import { useAdminStore } from "@/stores/admin-store";
import { formatPrice } from "@/lib/currency";
import { formatTime } from "@/lib/hours";
import { itemCount, visibleOptions } from "@/lib/order";
import { timeAgo } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface Props {
  order: Order;
  onAccept: (o: Order) => void;
  large?: boolean;
  now: number;
}

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  ACCEPTED: { to: "PREPARING", label: "Lancer la préparation" },
  PREPARING: { to: "READY", label: "Marquer prête" },
  READY: { to: "COMPLETED", label: "Remise au client" },
};

export function OrderCard({ order, onAccept, large, now }: Props) {
  const setStatus = useAdminStore((s) => s.setOrderStatus);
  const next = NEXT[order.status];
  const late = order.status !== "READY" && new Date(order.pickup.time).getTime() < now;

  return (
    <motion.article
      layout
      layoutId={order.id}
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className={cn(
        "relative rounded-sm border bg-panel p-3",
        order.status === "PENDING" ? "border-cheddar before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-cheddar" : "border-edge",
        large && "p-4",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/admin/commandes/${order.id}`} className={cn("font-display leading-none tabular-nums hover:text-cheddar", large ? "text-4xl" : "text-3xl")}>
            #{order.number.replace("BYM-", "")}
          </Link>
          <p className="mt-1 text-[0.7rem] text-bone/45">{timeAgo(order.createdAt, now)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.status} />
          {order.isDemo && <span className="text-[0.6rem] font-bold tracking-wider text-bone/35 uppercase">Démo</span>}
        </div>
      </header>

      <div className={cn("mt-2 flex flex-wrap items-center gap-x-4 gap-y-1", large ? "text-base" : "text-[0.85rem]")}>
        <span className="font-semibold">{order.customer.firstName}</span>
        <span className={cn("inline-flex items-center gap-1", late ? "text-danger" : "text-bone/70")}>
          <Clock className="size-3.5" aria-hidden />
          {order.pickup.mode === "asap" ? "Au plus vite · " : ""}
          {formatTime(order.pickup.time)}
          {late && " · en retard"}
        </span>
        <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-bone/55 hover:text-bone">
          <Phone className="size-3.5" aria-hidden />
          <span className="sr-only">Appeler</span>
          {order.customer.phone}
        </a>
      </div>

      <ul className={cn("mt-2.5 space-y-1 border-t border-edge pt-2.5", large ? "text-[1.05rem]" : "text-[0.85rem]")}>
        {order.items.map((i, idx) => (
          <li key={idx}>
            <span className="font-bold tabular-nums">{i.quantity} ×</span> {i.name}
            {visibleOptions(i.options).length > 0 && <span className="block pl-6 text-xs text-bone/55">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</span>}
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-3 flex gap-2 rounded-xs bg-cheddar/10 p-2 text-xs text-cheddar">
          <MessageSquareText className="size-3.5 shrink-0" aria-hidden /> {order.notes}
        </p>
      )}

      <footer className="mt-3 flex items-center justify-between gap-3 border-t border-edge pt-2.5">
        <span className="text-sm text-bone/60">
          {itemCount(order)} art. · <span className="font-semibold text-bone tabular-nums">{formatPrice(order.total)}</span>
        </span>
        <div className="flex gap-2">
          {order.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => window.confirm(`Refuser la commande #${order.number.replace("BYM-", "")} ?`) && setStatus(order.id, "CANCELLED")}
                className="h-9 rounded-sm border border-edge px-3 text-[0.7rem] font-bold tracking-wide uppercase hover:border-danger hover:text-danger"
              >
                Refuser
              </button>
              <button type="button" onClick={() => onAccept(order)} className="h-9 rounded-sm bg-cheddar px-3 text-[0.7rem] font-bold tracking-wide text-ink uppercase hover:bg-bone">
                Accepter
              </button>
            </>
          )}
          {next && (
            <button type="button" onClick={() => setStatus(order.id, next.to)} className="h-9 rounded-sm bg-bone px-3 text-[0.7rem] font-bold tracking-wide text-ink uppercase hover:bg-cheddar">
              {next.label}
            </button>
          )}
        </div>
      </footer>
    </motion.article>
  );
}
