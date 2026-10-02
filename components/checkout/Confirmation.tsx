"use client";

import { motion } from "framer-motion";
import { Check, MapPin, Phone } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useAdminStore } from "@/stores/admin-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { directionsUrl, restaurant } from "@/data/restaurant";
import { formatDayTime, formatTime } from "@/lib/hours";
import { formatPrice, multiplyCents } from "@/lib/currency";
import { visibleOptions } from "@/lib/order";
import type { OrderStatus } from "@/types/order";
import { cn } from "@/lib/utils";

const STEPS: { status: OrderStatus[]; label: string }[] = [
  { status: ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED"], label: "Envoyée" },
  { status: ["ACCEPTED", "PREPARING", "READY", "COMPLETED"], label: "Acceptée" },
  { status: ["PREPARING", "READY", "COMPLETED"], label: "En préparation" },
  { status: ["READY", "COMPLETED"], label: "Prête" },
];

export function Confirmation() {
  const hydrated = useHydrated();
  const lastId = useCheckoutStore((s) => s.lastOrderId);
  const order = useAdminStore((s) => s.orders.find((o) => o.id === lastId));

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!order) {
    return <EmptyState className="min-h-[60vh] justify-center" title="Aucune commande en cours" text="Votre dernière commande n’a pas été retrouvée sur cet appareil." action={{ href: "/menu", label: "Voir la carte" }} />;
  }

  const cancelled = order.status === "CANCELLED";
  const pickupLabel = order.pickup.mode === "asap" ? formatTime(order.pickup.time) : formatDayTime(order.pickup.time);

  return (
    <div className="shell grid gap-6 py-8 md:py-12 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="rounded-xl border border-line bg-white p-6 md:p-10">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} className="grid size-14 place-items-center rounded-full bg-ink text-white">
          <Check className="size-7" strokeWidth={3} aria-hidden />
        </motion.span>
        <h1 className="mt-6 font-display text-[2.6rem] leading-none md:text-[3.6rem]">Merci pour votre commande</h1>
        <p className="mt-3 text-lg text-muted">{cancelled ? "Votre commande a été annulée par le restaurant. Appelez-nous si besoin." : `Merci ${order.customer.firstName}, votre commande a bien été envoyée au restaurant.`}</p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-cream p-4">
            <dt className="text-sm text-muted">Commande</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">#{order.number}</dd>
          </div>
          <div className="rounded-lg bg-cream p-4">
            <dt className="text-sm text-muted">Retrait estimé</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums first-letter:uppercase">{pickupLabel}</dd>
          </div>
        </dl>

        {!cancelled && (
          <ol aria-label="Suivi de la commande" className="mt-8 grid grid-cols-4 gap-2">
            {STEPS.map((s) => {
              const done = s.status.includes(order.status);
              return (
                <li key={s.label}>
                  <span className={cn("block h-1.5 rounded-full transition-colors duration-500", done ? "bg-ink" : "bg-line")} />
                  <span className={cn("mt-2 block text-xs font-semibold sm:text-sm", done ? "text-ink" : "text-muted")}>{s.label}</span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-8 flex items-start gap-3 border-t border-line pt-6">
          <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
          <address className="leading-relaxed not-italic">
            <strong className="font-bold">{restaurant.name}</strong>
            <br />
            {restaurant.address.street}
            <br />
            {restaurant.address.postalCode} {restaurant.address.city}
          </address>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <ButtonLink href={directionsUrl} variant="dark" size="lg">
            Itinéraire
          </ButtonLink>
          <ButtonLink href={restaurant.phone.href} variant="outline" size="lg">
            <Phone className="size-4" aria-hidden /> Appeler
          </ButtonLink>
          <ButtonLink href="/menu" variant="ghost" size="lg">
            Retour à la carte
          </ButtonLink>
        </div>
      </div>

      <aside aria-labelledby="conf-recap" className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-5 md:p-6">
          <h2 id="conf-recap" className="text-lg font-bold">
            Récapitulatif
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {order.items.map((i, idx) => (
              <li key={`${i.productId}-${idx}`} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">
                    {i.quantity} × {i.name}
                  </p>
                  {visibleOptions(i.options).length > 0 && <p className="text-sm text-muted">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</p>}
                </div>
                <span className="tabular-nums">{formatPrice(multiplyCents(i.unitPrice, i.quantity))}</span>
              </li>
            ))}
          </ul>
          {order.notes && <p className="border-t border-line pt-3 text-sm text-muted">Note : {order.notes}</p>}
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-bold">Total à régler sur place</span>
            <span className="text-2xl font-bold tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
