"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Phone } from "lucide-react";
import { useCart } from "@/features/cart/store";
import { takePendingOrder } from "@/features/checkout/pending";
import { useSite } from "@/features/site-context";
import type { PublicOrder } from "@/features/orders/public";
import { mapsLinks } from "@/data/brand";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/money";
import { formatParisDateTime, formatParisTime, parisParts } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "new", label: "Reçue" },
  { key: "preparing", label: "En préparation" },
  { key: "ready", label: "Prête" },
  { key: "completed", label: "Récupérée" },
] as const;

const POLL_MS = { pending: 2_500, active: 10_000 } as const;

/** Suivi client : statut en direct (polling), récapitulatif, retrait. */
export function OrderTracking({ orderNumber, token, initial, paymentFailed = false }: { orderNumber: string; token: string; initial: PublicOrder; paymentFailed?: boolean }) {
  const { store } = useSite();
  const [order, setOrder] = useState(initial);
  const [stale, setStale] = useState(false);
  const cleared = useRef(false);
  const pendingSince = useRef(Date.now());

  const confirmed = order.orderStatus !== "payment_pending" && order.orderStatus !== "cancelled";
  const finished = order.orderStatus === "completed" || order.orderStatus === "cancelled";

  // Panier vidé une fois la commande confirmée, si elle a été passée depuis ce navigateur.
  useEffect(() => {
    if (confirmed && !cleared.current && takePendingOrder(orderNumber)) {
      cleared.current = true;
      useCart.getState().clear();
    }
  }, [confirmed, orderNumber]);

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
      const pending = order.orderStatus === "payment_pending" && Date.now() - pendingSince.current < 5 * 60_000;
      timer = window.setTimeout(tick, document.hidden ? 30_000 : pending ? POLL_MS.pending : POLL_MS.active);
    };
    timer = window.setTimeout(tick, order.orderStatus === "payment_pending" ? 1_200 : POLL_MS.active);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [orderNumber, token, finished, order.orderStatus]);

  const time = formatParisTime(order.requestedTime);
  const sameDay = parisParts(new Date(order.requestedTime)).ymd === parisParts(new Date()).ymd;
  const when = sameDay ? `aujourd’hui à ${time.replace(":", "h")}` : formatParisDateTime(order.requestedTime);
  const stepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
  const maps = mapsLinks(`${store.street}, ${store.postalCode} ${store.city}`);

  return (
    <div className="shell pt-28 pb-28 md:pt-36">
      <Headline order={order} paymentFailed={paymentFailed} />

      {confirmed && (
        <>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-sub">
            Merci {order.firstName}. Commande <span className="font-semibold text-fg">{order.orderNumber}</span> — retrait {order.isAsap ? "dès que possible, " : ""}
            {when}, au {store.street}.
          </p>
          <ol className="mt-12 grid grid-cols-4 gap-2" aria-label="Avancement de la commande">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex;
              return (
                <li key={s.key} aria-current={i === stepIndex ? "step" : undefined}>
                  <span className={cn("block h-[3px] transition-colors duration-700", done ? "bg-ink" : "bg-ink/12")} />
                  <span className={cn("mt-3 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.16em] uppercase md:text-[0.74rem]", done ? "text-fg" : "text-sub/70")}>
                    {done && <Check className="size-3.5 shrink-0" aria-hidden strokeWidth={3} />}
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        Statut : {order.orderStatus}
      </p>
      {stale && !finished && <p className="mt-4 text-xs text-sub">Connexion instable : le statut se mettra à jour automatiquement.</p>}

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <section aria-labelledby="recap-title" className="lg:col-span-7">
          <h2 id="recap-title" className="kicker border-b border-ink pb-3">
            Récapitulatif
          </h2>
          <ul className="divide-y divide-rule">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-6 py-4">
                <div>
                  <p className="font-semibold">
                    <span className="tabular-nums">{it.quantity} ×</span> {it.name}
                  </p>
                  {it.details.length > 0 && <p className="mt-1 text-sm text-sub">{it.details.join(" · ")}</p>}
                </div>
                <p className="shrink-0 tabular-nums">{formatPrice(it.lineTotalCents)}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-ink pt-4">
            <p className="kicker">Total TTC</p>
            <p className="font-serif text-3xl tabular-nums">{formatPrice(order.totalCents)}</p>
          </div>
          <p className="mt-3 text-sm text-sub">{paymentLabel(order)}</p>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <div className="border border-rule bg-panel p-6">
            <p className="kicker text-brass-deep">Retrait</p>
            <p className="mt-3 font-serif text-2xl leading-tight">
              {store.street}
              <br />
              {store.postalCode} {store.city}
            </p>
            <p className="mt-3 text-sm text-sub">Donnez votre numéro de commande au comptoir.</p>
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
    </div>
  );
}

function Headline({ order, paymentFailed }: { order: PublicOrder; paymentFailed: boolean }) {
  if (order.orderStatus === "payment_pending" && paymentFailed) {
    return (
      <div role="alert">
        <p className="kicker text-closed">Commande {order.orderNumber}</p>
        <h1 className="display-2 mt-5">
          Paiement <span className="italic">non abouti.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sub">Aucune somme n’a été débitée et la commande n’a pas été envoyée en cuisine. Votre panier est conservé : vous pouvez réessayer.</p>
        <ButtonLink href="/checkout" variant="ink" size="lg" arrow className="mt-8">
          Réessayer
        </ButtonLink>
      </div>
    );
  }
  if (order.orderStatus === "payment_pending") {
    return (
      <div aria-live="polite">
        <p className="kicker text-brass-deep">Commande {order.orderNumber}</p>
        <h1 className="display-2 mt-5">
          Paiement <span className="italic">en cours…</span>
        </h1>
        <p className="mt-6 max-w-xl text-sub">Nous attendons la confirmation de votre banque. Cette page se met à jour toute seule. Si le paiement n’aboutit pas, la commande ne sera pas préparée et rien ne sera débité.</p>
      </div>
    );
  }
  if (order.orderStatus === "cancelled") {
    const refunded = order.paymentStatus === "refunded" || order.paymentStatus === "partially_refunded";
    return (
      <div>
        <p className="kicker text-closed">Commande {order.orderNumber}</p>
        <h1 className="display-2 mt-5">
          Commande <span className="italic">annulée.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sub">
          {refunded ? "Le remboursement a été effectué sur votre moyen de paiement (délai bancaire de quelques jours)." : order.paymentStatus === "failed" ? "Le paiement n’a pas abouti : aucune somme n’a été débitée." : "Contactez le restaurant pour toute question."}
        </p>
        <ButtonLink href="/menu" variant="ink" size="lg" arrow className="mt-8">
          Revenir à la carte
        </ButtonLink>
      </div>
    );
  }
  const title =
    order.orderStatus === "ready" ? (
      <>
        Elle vous <span className="italic">attend.</span>
      </>
    ) : order.orderStatus === "completed" ? (
      <>
        Bon <span className="italic">appétit.</span>
      </>
    ) : (
      <>
        C’est <span className="italic">parti.</span>
      </>
    );
  return (
    <div>
      <p className="kicker text-brass-deep">Commande {order.orderNumber} · confirmée</p>
      <h1 className="display-1 mt-5">{title}</h1>
    </div>
  );
}

function paymentLabel(o: PublicOrder) {
  if (o.paymentMethod === "on_site") return o.paymentStatus === "paid" ? "Payée au comptoir." : "À régler au retrait (espèces ou carte).";
  if (o.paymentStatus === "paid") return "Payée en ligne.";
  if (o.paymentStatus === "refunded") return "Remboursée.";
  if (o.paymentStatus === "partially_refunded") return "Partiellement remboursée.";
  if (o.paymentStatus === "failed") return "Paiement non abouti.";
  return "Paiement en attente de confirmation.";
}
