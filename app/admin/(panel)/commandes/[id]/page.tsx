"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AcceptDialog } from "@/components/admin/AcceptDialog";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { formatDayTime } from "@/lib/hours";
import { STATUS_FLOW, STATUS_LABELS, visibleOptions } from "@/lib/order";
import { timeAgo } from "@/lib/admin";
import type { Order } from "@/types/order";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useAdminStore((s) => s.orders.find((o) => o.id === id));
  const setStatus = useAdminStore((s) => s.setOrderStatus);
  const [accepting, setAccepting] = useState<Order | null>(null);

  if (!order) {
    return (
      <div className="py-24 text-center">
        <p className="text-3xl font-bold">Commande introuvable.</p>
        <Link href="/admin/commandes" className="mt-6 inline-block text-sm underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/commandes" className="mb-6 inline-flex items-center gap-2 text-sm text-cream/60 hover:text-cream">
        <ArrowLeft className="size-4" aria-hidden /> Commandes
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="text-5xl leading-none font-extrabold tracking-tight tabular-nums">#{order.number.replace("BYM-", "")}</h1>
        <StatusBadge status={order.status} />
        {order.isDemo && <span className="text-xs text-cream/40">Commande de démonstration</span>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-sm border border-edge bg-panel p-6 lg:col-span-2">
          <h2 className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Contenu</h2>
          <ul className="mt-4 divide-y divide-edge">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">
                    {i.quantity} × {i.name}
                  </p>
                  {visibleOptions(i.options).length > 0 && <p className="text-sm text-cream/55">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</p>}
                </div>
                <span className="tabular-nums">{formatPrice(multiplyCents(i.unitPrice, i.quantity))}</span>
              </li>
            ))}
          </ul>
          {order.notes && <p className="mt-4 rounded-xs bg-cream/10 p-3 text-sm text-cream">Note client : {order.notes}</p>}
          <div className="mt-6 flex justify-between border-t border-edge pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-3xl font-bold tabular-nums">{formatPrice(order.total)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-cream/50">
            Paiement : {order.paymentMethod === "cash_on_pickup" ? "au retrait" : "en ligne"} · {order.paymentStatus === "paid" ? "réglé" : "non réglé"}
          </p>
        </section>

        <div className="space-y-6">
          <section className="rounded-sm border border-edge bg-panel p-6">
            <h2 className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Client</h2>
            <p className="mt-3 text-lg font-semibold">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="mt-2 flex items-center gap-2 text-sm hover:text-cream">
              <Phone className="size-4" aria-hidden /> {order.customer.phone}
            </a>
            <a href={`mailto:${order.customer.email}`} className="mt-1 flex items-center gap-2 text-sm break-all hover:text-cream">
              <Mail className="size-4" aria-hidden /> {order.customer.email}
            </a>
          </section>
          <section className="rounded-sm border border-edge bg-panel p-6">
            <h2 className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Retrait</h2>
            <p className="mt-3 text-lg first-letter:uppercase">{formatDayTime(order.pickup.time)}</p>
            <p className="text-sm text-cream/55">{order.pickup.mode === "asap" ? "Dès que possible" : "Créneau choisi"} · reçue {timeAgo(order.createdAt)}</p>
            {order.announcedMinutes && <p className="mt-1 text-sm text-cream/55">Préparation annoncée : {order.announcedMinutes} min</p>}
          </section>
          <section className="space-y-2">
            {order.status === "PENDING" && (
              <Button variant="primary" className="w-full" onClick={() => setAccepting(order)}>
                Accepter
              </Button>
            )}
            {STATUS_FLOW[order.status]
              .filter((s) => !(order.status === "PENDING" && s === "ACCEPTED"))
              .map((s) => (
                <Button
                  key={s}
                  variant={s === "CANCELLED" ? "outline" : "light"}
                  className="w-full"
                  onClick={() => (s !== "CANCELLED" || window.confirm("Annuler cette commande ?")) && setStatus(order.id, s)}
                >
                  {s === "CANCELLED" ? (order.status === "PENDING" ? "Refuser" : "Annuler la commande") : `Passer en « ${STATUS_LABELS[s]} »`}
                </Button>
              ))}
          </section>
        </div>
      </div>
      <AcceptDialog order={accepting} onClose={() => setAccepting(null)} />
    </>
  );
}
