"use client";

import { Price } from "@/components/ui/Price";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useAdminStore } from "@/stores/admin-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReceiptLineArt } from "@/components/ui/LineArt";
import { ButtonLink } from "@/components/ui/Button";
import { directionsUrl, fullAddress, restaurant } from "@/data/restaurant";
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

  if (!hydrated) return <div className="min-h-[70vh]" aria-busy="true" />;
  if (!order) {
    return (
      <EmptyState
        className="min-h-[70vh] justify-center pt-32"
        art={<ReceiptLineArt />}
        lines={["Aucune commande", "en cours."]}
        text="Ta dernière commande n’a pas été retrouvée sur cet appareil."
        action={{ href: "/menu", label: "Voir la carte" }}
      />
    );
  }

  const cancelled = order.status === "CANCELLED";
  const pickupLabel = order.pickup.mode === "asap" ? `vers ${formatTime(order.pickup.time)}` : formatDayTime(order.pickup.time);

  return (
    <div className="container-site pt-32 pb-24 md:pt-44">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <svg viewBox="0 0 64 64" className="size-16 text-rose" aria-hidden>
            <motion.circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} />
            <motion.path d="M20 33l8 8 16-17" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.55 }} />
          </svg>
          <h1 className="mt-8 font-display text-mega font-medium uppercase [overflow-wrap:anywhere]">
            Merci
            <br />
            <span className="text-rose">{order.customer.firstName}.</span>
          </h1>
          <p className="mt-8 text-lg text-cream/80">{cancelled ? "Ta commande a été annulée par le restaurant. Appelle-nous si besoin." : "Ta commande a bien été envoyée au restaurant."}</p>
          <p className="mt-6 text-3xl font-extrabold tracking-tight tabular-nums md:text-4xl">
            <span className="text-cream/45">Commande</span> #{order.number}
          </p>

          {!cancelled && (
            <ol aria-label="Suivi de la commande" className="mt-10 grid grid-cols-4 gap-2">
              {STEPS.map((s) => {
                const done = s.status.includes(order.status);
                return (
                  <li key={s.label}>
                    <span className={cn("block h-1 rounded-full transition-colors duration-700", done ? "bg-rose" : "bg-cream/15")} />
                    <span className={cn("mt-3 flex items-center gap-1.5 text-xs font-semibold sm:text-sm", done ? "text-cream" : "text-cream/45")}>
                      {done && <Check className="size-3.5 text-rose" aria-hidden />}
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <dl className="mt-12 grid gap-8 border-t border-cream/12 pt-8 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold tracking-[0.14em] text-cream/55 uppercase">Retrait estimé</dt>
              <dd className="mt-2 text-xl first-letter:uppercase">{pickupLabel}</dd>
              {order.announcedMinutes && <dd className="mt-1 text-sm text-cream/60">Préparation annoncée : {order.announcedMinutes} min</dd>}
            </div>
            <div>
              <dt className="text-xs font-bold tracking-[0.14em] text-cream/55 uppercase">Adresse</dt>
              <dd className="mt-2 text-xl">{fullAddress}</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={directionsUrl} variant="rose" arrow>
              Voir l’itinéraire
            </ButtonLink>
            <ButtonLink href={restaurant.phone.href} variant="outline-light">
              Appeler le restaurant
            </ButtonLink>
            <ButtonLink href="/" variant="ghost-light">
              Retour à l’accueil
            </ButtonLink>
          </div>
        </div>

        <aside aria-labelledby="conf-recap" className="lg:col-span-5">
          <div className="rounded-sm border border-cream/12 bg-ink-warm p-6 md:p-8">
            <h2 id="conf-recap" className="text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">
              Récapitulatif
            </h2>
            <ul className="mt-5 space-y-4">
              {order.items.map((i, idx) => (
                <li key={`${i.productId}-${idx}`} className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {i.quantity} × {i.name}
                    </p>
                    {visibleOptions(i.options).length > 0 && <p className="text-xs text-cream/55">{visibleOptions(i.options).map((o) => o.label).join(" · ")}</p>}
                  </div>
                  <span className="tabular-nums">{formatPrice(multiplyCents(i.unitPrice, i.quantity))}</span>
                </li>
              ))}
            </ul>
            {order.notes && <p className="mt-5 border-t border-cream/10 pt-4 text-sm text-cream/70">Note : {order.notes}</p>}
            <div className="mt-6 flex items-baseline justify-between border-t border-cream/10 pt-5">
              <span className="text-sm font-bold uppercase">Total · à régler sur place</span>
              <span className="font-display text-3xl tabular-nums"><Price cents={order.total} /></span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
