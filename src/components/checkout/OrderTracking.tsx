"use client";

import { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import { useCart } from "@/features/cart/store";
import { forgetPendingOrder, takePendingOrder } from "@/features/checkout/pending";
import { useSite } from "@/features/site-context";
import type { PublicOrder } from "@/features/orders/public";
import { mapsLinks } from "@/data/brand";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/money";
import { formatParisDateTime, formatParisTime, parisParts } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const STEPS = ["Commande reçue", "Acceptée", "En préparation", "Prête"] as const;
const POLL_MS = { pending: 2_500, active: 8_000 } as const;
const NOT_PAID = new Set<PublicOrder["paymentStatus"]>(["failed", "canceled", "expired", "pending"]);

/** Suivi client /commande/M1042 : grand numéro, avancement en direct (polling), récapitulatif, retrait. */
export function OrderTracking({ orderNumber, token, initial }: { orderNumber: string; token: string; initial: PublicOrder }) {
  const { store } = useSite();
  const [order, setOrder] = useState(initial);
  const [stale, setStale] = useState(false);
  const cleared = useRef(false);
  const pendingSince = useRef(Date.now());

  const status = order.orderStatus;
  const confirmed = status !== "payment_pending" && status !== "cancelled";
  const finished = status === "completed" || status === "cancelled";
  const paymentAborted = status === "cancelled" && !order.refused && !order.accepted && order.paymentMethod === "card" && NOT_PAID.has(order.paymentStatus);

  // Panier vidé une fois la commande confirmée, si elle a été passée depuis cet onglet.
  useEffect(() => {
    if (confirmed && !cleared.current && takePendingOrder(orderNumber)) {
      cleared.current = true;
      useCart.getState().clear();
    }
    // Paiement non abouti : le panier reste intact, la tentative est oubliée.
    if (paymentAborted) forgetPendingOrder();
  }, [confirmed, paymentAborted, orderNumber]);

  useEffect(() => {
    if (status === "ready") document.title = `Prête · ${orderNumber} — Burger By M`;
  }, [status, orderNumber]);

  useEffect(() => {
    if (finished) return;
    let timer = 0;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (res.ok) {
          setOrder((await res.json()) as PublicOrder);
          setStale(false);
        } else setStale(true);
      } catch {
        setStale(true);
      }
      if (stopped) return;
      const waitingPayment = status === "payment_pending" && Date.now() - pendingSince.current < 5 * 60_000;
      timer = window.setTimeout(tick, document.hidden ? 30_000 : waitingPayment ? POLL_MS.pending : POLL_MS.active);
    };
    timer = window.setTimeout(tick, status === "payment_pending" ? 1_200 : POLL_MS.active);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [orderNumber, token, finished, status]);

  const time = formatParisTime(order.requestedTime).replace(":", "h");
  const sameDay = parisParts(new Date(order.requestedTime)).ymd === parisParts(new Date()).ymd;
  const when = sameDay ? time : formatParisDateTime(order.requestedTime);
  const step = status === "new" ? 0 : status === "preparing" ? 2 : status === "ready" || status === "completed" ? 3 : -1;
  const maps = mapsLinks(`${store.street}, ${store.postalCode} ${store.city}`);
  const head = headline(order, paymentAborted);

  return (
    <>
      <section data-theme="dark" className="on-dark bg-ink pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container-bm">
          <h1>
            <span className={cn("t-label block", head.alert ? "text-closed" : "text-cheddar")}>{head.label}</span>
            <span className="t-xxl mt-4 block tabular-nums" aria-label={`Commande numéro ${order.orderNumber}`}>
              {order.orderNumber}
            </span>
          </h1>
          <p className={cn("mt-4", head.loud ? "t-l max-w-4xl" : "s-xl")} aria-live="polite">
            {head.title}
          </p>
          {head.text && <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-cream/75">{head.text}</p>}

          {confirmed && (
            <ol className="mt-12 grid grid-cols-4 gap-2 md:mt-16 md:gap-3" aria-label="Avancement de la commande">
              {STEPS.map((label, i) => {
                const done = i <= step;
                const current = i === step;
                return (
                  <li key={label} aria-current={current ? "step" : undefined}>
                    <span className="block h-[3px] overflow-hidden bg-cream/12">
                      <span className={cn("block h-full origin-left bg-cheddar transition-transform duration-700 ease-food", done ? "scale-x-100" : "scale-x-0")} style={{ transitionDelay: `${i * 120}ms` }} />
                    </span>
                    <span className={cn("t-label mt-3 block text-[0.6rem] leading-snug md:text-[0.7rem]", current ? "text-cheddar" : done ? "text-cream" : "text-cream/35")}>{label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {head.actions}

          {confirmed && (
            <dl className="mt-12 grid gap-px bg-graphite sm:grid-cols-3">
              <div className="bg-ink py-4 sm:pr-6">
                <dt className="t-label text-cream/50">{order.isAsap ? "Prête vers" : "Retrait prévu"}</dt>
                <dd className="t-m mt-2 tabular-nums">{when}</dd>
              </div>
              <div className="bg-ink py-4 sm:px-6">
                <dt className="t-label text-cream/50">Total</dt>
                <dd className="t-m mt-2 text-cheddar tabular-nums">{formatPrice(order.totalCents)}</dd>
              </div>
              <div className="bg-ink py-4 sm:pl-6">
                <dt className="t-label text-cream/50">Retrait sur place</dt>
                <dd className="mt-2 font-semibold">
                  {store.street}, {store.city}
                </dd>
              </div>
            </dl>
          )}
          {confirmed && status !== "completed" && <p className="s-l mt-10 text-pink">Présentez votre numéro au comptoir.</p>}

          <p className="sr-only" aria-live="polite">
            Statut : {head.label}
          </p>
          {stale && !finished && <p className="mt-6 text-xs text-cream/60">Connexion instable : le statut se mettra à jour automatiquement.</p>}
        </div>
      </section>

      <section data-theme="light" className="on-light bg-ivory py-16 md:py-24">
        <div className="container-bm grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="t-label border-b-2 border-ink pb-3">Récapitulatif</h2>
            <ul className="divide-y divide-dashed divide-ink/20">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-6 py-4">
                  <div>
                    <p className="font-semibold">
                      <span className="tabular-nums">{it.quantity} ×</span> {it.name}
                    </p>
                    {it.details.length > 0 && <p className="mt-1 text-sm text-sub">{it.details.join(" · ")}</p>}
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">{formatPrice(it.lineTotalCents)}</p>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t-2 border-ink pt-4">
              <p className="t-label">Total TTC</p>
              <p className="t-l tabular-nums">{formatPrice(order.totalCents)}</p>
            </div>
            <p className="mt-3 text-sm text-sub">{paymentLabel(order)}</p>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="bg-cream p-6">
              <p className="t-label text-cheddar-deep">Retrait au restaurant</p>
              <p className="t-m mt-3">
                {store.street}
                <br />
                {store.postalCode} {store.city}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink href={maps.directions} variant="ink" size="md">
                  Itinéraire
                </ButtonLink>
                <ButtonLink href={store.phoneHref} variant="line" size="md">
                  <Phone className="size-4" aria-hidden /> Appeler
                </ButtonLink>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-sub">Gardez cette page : son lien est personnel et permet de suivre votre commande. Une question ? Appelez le {store.phone}.</p>
          </aside>
        </div>
      </section>
    </>
  );
}

type Head = { label: string; title: React.ReactNode; text?: string; loud?: boolean; alert?: boolean; actions?: React.ReactNode };

function headline(o: PublicOrder, paymentAborted: boolean): Head {
  if (o.orderStatus === "payment_pending") {
    return {
      label: "Paiement en cours",
      title: "On attend votre banque…",
      text: "Cette page se met à jour toute seule. Tant que le paiement n’est pas confirmé, la commande ne part pas en cuisine et rien n’est débité.",
      actions: o.resumePaymentUrl ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <ButtonLink href={o.resumePaymentUrl} variant="cheddar" size="lg">
            Reprendre le paiement
          </ButtonLink>
          <ButtonLink href="/checkout" variant="line" size="lg">
            Modifier ma commande
          </ButtonLink>
        </div>
      ) : undefined,
    };
  }
  if (o.orderStatus === "cancelled" && o.refused) {
    const text =
      o.paymentMethod === "on_site"
        ? "Rien à régler. Pour toute question, appelez le restaurant."
        : o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded"
          ? "Le montant payé vous est intégralement remboursé (délai bancaire de quelques jours)."
          : o.paymentStatus === "paid"
            ? "Le restaurant procède à votre remboursement. Pour toute question, appelez-nous."
            : "Rien n’a été débité : la réservation du montant sur votre carte est levée.";
    return {
      label: "Commande refusée",
      alert: true,
      loud: true,
      title: "Votre commande n’a pas pu être acceptée.",
      text,
      actions: <BackToMenu />,
    };
  }
  if (paymentAborted) {
    return {
      label: "Paiement non abouti",
      alert: true,
      title: "Le paiement n’est pas passé.",
      text:
        o.paymentStatus === "expired"
          ? "Le délai de paiement est dépassé : rien n’a été débité et la commande n’a pas été envoyée en cuisine. Votre panier est conservé."
          : "Rien n’a été débité et la commande n’a pas été envoyée en cuisine. Votre panier est conservé : vous pouvez réessayer.",
      actions: (
        <div className="mt-8">
          <ButtonLink href="/checkout" variant="cheddar" size="lg" arrow>
            Réessayer
          </ButtonLink>
        </div>
      ),
    };
  }
  if (o.orderStatus === "cancelled") {
    const refunded = o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded";
    return {
      label: "Commande annulée",
      alert: true,
      title: "Commande annulée.",
      text: refunded ? "Le remboursement a été effectué sur votre moyen de paiement (délai bancaire de quelques jours)." : "Pour toute question, appelez le restaurant.",
      actions: <BackToMenu />,
    };
  }
  if (o.orderStatus === "new") {
    return {
      label: "Commande reçue",
      title: "Bien reçue.",
      text: o.paymentStatus === "authorized" ? "La cuisine valide votre commande. Le montant est réservé sur votre carte et ne sera encaissé qu’à l’acceptation." : "La cuisine valide votre commande dans un instant.",
    };
  }
  if (o.orderStatus === "preparing") return { label: "En préparation", title: "C’est parti.", text: "Commande acceptée : le smash est sur la plaque." };
  if (o.orderStatus === "ready") return { label: "Prête", title: "Elle vous attend.", text: "Votre commande est prête au comptoir." };
  return { label: "Récupérée", title: "Bon appétit." };
}

function BackToMenu() {
  return (
    <div className="mt-8">
      <ButtonLink href="/menu" variant="ivory" size="lg" arrow>
        Revenir à la carte
      </ButtonLink>
    </div>
  );
}

function paymentLabel(o: PublicOrder) {
  if (o.paymentMethod === "on_site") return o.paymentStatus === "paid" ? "Payée au comptoir." : o.orderStatus === "cancelled" ? "Rien à régler." : "À régler au retrait (espèces ou carte).";
  switch (o.paymentStatus) {
    case "authorized":
      return "Montant réservé sur votre carte, encaissé à l’acceptation de la commande.";
    case "paid":
      return "Payée en ligne.";
    case "refunded":
      return "Remboursée.";
    case "partially_refunded":
      return "Partiellement remboursée.";
    case "canceled":
      return "Réservation annulée : rien n’a été débité.";
    case "expired":
      return "Paiement expiré : rien n’a été débité.";
    case "failed":
      return "Paiement non abouti : rien n’a été débité.";
    default:
      return "Paiement en attente de confirmation.";
  }
}
