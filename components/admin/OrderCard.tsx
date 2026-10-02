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
        "rounded-sm border bg-ink-warm p-4",
        order.status === "PENDING" ? "border-rose/60 shadow-[0_0_0_1px_rgba(242,193,189,0.25)]" : "border-cream/10",
        large && "p-5",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/admin/commandes/${order.id}`} className={cn("font-sans leading-none font-extrabold tracking-tight tabular-nums hover:text-rose", large ? "text-3xl" : "text-2xl")}>
            #{order.number.replace("BYM-", "")}
          </Link>
          <p className="mt-1 text-xs text-cream/50">{timeAgo(order.createdAt, now)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.status} />
          {order.isDemo && <span className="text-[0.6rem] font-bold tracking-wider text-cream/35 uppercase">Démo</span>}
        </div>
      </header>

      <div className={cn("mt-3 flex flex-wrap items-center gap-x-4 gap-y-1", large ? "text-base" : "text-sm")}>
        <span className="font-semibold">{order.customer.firstName}</span>
        <span className={cn("inline-flex items-center gap-1", late ? "text-[#ff9b94]" : "text-cream/70")}>
          <Clock className="size-3.5" aria-hidden />
          {order.pickup.mode === "asap" ? "Au plus vite · " : ""}
          {formatTime(order.pickup.time)}
          {late && " · en retard"}
        </span>
        <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-cream/55 hover:text-cream">
          <Phone className="size-3.5" aria-hidden />
          <span className="sr-only">Appeler</span>
          {order.customer.phone}
        </a>
      </div>

      <ul className={cn("mt-3 space-y-1.5 border-t border-cream/10 pt-3", large ? "text-[1.05rem]" : "text-sm")}>
        {order.items.map((i, idx) => (
          <li key={idx}>
            <span className="font-bold tabular-nums">{i.quantity} ×</span> {i.name}
            {visibleOptions(i.options).length > 0 && <span className="block pl-6 text-xs text-cream/55">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</span>}
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-3 flex gap-2 rounded-xs bg-cheddar/10 p-2 text-xs text-cheddar">
          <MessageSquareText className="size-3.5 shrink-0" aria-hidden /> {order.notes}
        </p>
      )}

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-cream/10 pt-3">
        <span className="text-sm text-cream/60">
          {itemCount(order)} art. · <span className="font-semibold text-cream tabular-nums">{formatPrice(order.total)}</span>
        </span>
        <div className="flex gap-2">
          {order.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => window.confirm(`Refuser la commande #${order.number.replace("BYM-", "")} ?`) && setStatus(order.id, "CANCELLED")}
                className="h-10 rounded-full border border-cream/20 px-4 text-xs font-bold uppercase hover:border-danger hover:text-[#ff9b94]"
              >
                Refuser
              </button>
              <button type="button" onClick={() => onAccept(order)} className="h-10 rounded-full bg-rose px-4 text-xs font-bold text-ink uppercase hover:bg-[#f6d0cc]">
                Accepter
              </button>
            </>
          )}
          {next && (
            <button type="button" onClick={() => setStatus(order.id, next.to)} className="h-10 rounded-full bg-cream px-4 text-xs font-bold text-ink uppercase hover:bg-ivory">
              {next.label}
            </button>
          )}
        </div>
      </footer>
    </motion.article>
  );
}
