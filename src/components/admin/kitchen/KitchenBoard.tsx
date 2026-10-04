"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bell, BellOff, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import type { OrderStatus } from "@/db/schema";
import type { OrderView } from "@/features/orders/service";
import { setOrderStatusAction } from "@/features/admin/actions/orders";
import { formatPrice } from "@/lib/money";
import { formatParisTime } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { AdminNotices, useNotify } from "../ui";
import { usePushSubscription } from "./use-push";
import { playChime, unlockAudio } from "./chime";

const COLUMNS: { status: OrderStatus; label: string; tone: string }[] = [
  { status: "new", label: "Nouvelles", tone: "bg-rose" },
  { status: "preparing", label: "En préparation", tone: "bg-brass" },
  { status: "ready", label: "Prêtes", tone: "bg-[#5fb98a]" },
  { status: "completed", label: "Terminées", tone: "bg-fg/30" },
];

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  new: { to: "preparing", label: "Lancer" },
  preparing: { to: "ready", label: "Prête" },
  ready: { to: "completed", label: "Récupérée" },
};
const BACK: Partial<Record<OrderStatus, { to: OrderStatus; label: string; title: string }>> = {
  preparing: { to: "new", label: "Retour", title: "Remettre dans « Nouvelles »" },
  ready: { to: "preparing", label: "Retour", title: "Remettre en préparation" },
  completed: { to: "ready", label: "Rouvrir", title: "Remettre dans « Prêtes »" },
};

/** « dans 12 min », « dans 3 h 05 », « 8 min de retard ». */
function relative(minutes: number) {
  if (minutes < 0) return `${-minutes} min de retard`;
  if (minutes === 0) return "maintenant";
  if (minutes < 60) return `dans ${minutes} min`;
  return `dans ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

const POLL_MS = 5_000;

/**
 * Écran cuisine (KDS) pour tablette : 4 colonnes, rafraîchissement automatique (secours du push),
 * changements d'état optimistes avec détection des conflits entre écrans.
 */
export function KitchenBoard({ initial, initialServerTime }: { initial: OrderView[]; initialServerTime: string }) {
  const notify = useNotify();
  const [orders, setOrders] = useState(initial);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(initialServerTime);
  const [sound, setSound] = useState(false);
  const [tab, setTab] = useState<OrderStatus>("new");
  const [fullscreen, setFullscreen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const known = useRef(new Set(initial.map((o) => o.id)));
  const soundRef = useRef(false);
  const inFlight = useRef(new Set<string>());
  const push = usePushSubscription();

  // Son : uniquement après activation explicite, à chaque ouverture de l'écran (règle des navigateurs).
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/kitchen", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin/login?next=/admin/kitchen";
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { orders: OrderView[]; serverTime: string };
      const fresh = body.orders.filter((o) => !known.current.has(o.id));
      fresh.forEach((o) => known.current.add(o.id));
      if (fresh.length) {
        setFlash((f) => new Set([...f, ...fresh.map((o) => o.id)]));
        window.setTimeout(() => setFlash((f) => new Set([...f].filter((id) => !fresh.some((o) => o.id === id)))), 12_000);
        if (soundRef.current) playChime();
        notify(fresh.length === 1 ? `Nouvelle commande ${fresh[0]!.orderNumber} — ${formatPrice(fresh[0]!.totalCents)}` : `${fresh.length} nouvelles commandes`);
      }
      // Les commandes en cours de modification gardent leur état local jusqu'à la réponse du serveur.
      setOrders((prev) => body.orders.map((o) => (inFlight.current.has(o.id) ? (prev.find((p) => p.id === o.id) ?? o) : o)));
      setLastSync(body.serverTime);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [notify]);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    const onMessage = (e: MessageEvent) => (e.data as { type?: string } | null)?.type === "push" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // L'écran reste allumé pendant le service (si le navigateur le permet).
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        if ("wakeLock" in navigator && document.visibilityState === "visible") lock = await navigator.wakeLock.request("screen");
      } catch {
        /* refusé : sans conséquence */
      }
    };
    void request();
    const onVisible = () => void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const move = async (order: OrderView, to: OrderStatus) => {
    if (inFlight.current.has(order.id)) return;
    inFlight.current.add(order.id);
    const from = order.orderStatus;
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, orderStatus: to } : o)));
    const r = await setOrderStatusAction(order.id, from, to).catch(() => ({ ok: false as const, error: "Connexion perdue : changement non enregistré." }));
    inFlight.current.delete(order.id);
    if (!r.ok) {
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, orderStatus: from } : o)));
      notify(r.error, "error");
      void refresh();
    }
  };

  const toggleSound = () => {
    const next = !sound;
    if (next) {
      unlockAudio();
      playChime();
    }
    setSound(next);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      notify("Plein écran indisponible sur cet appareil.", "error");
    }
  };

  const grouped = useMemo(() => {
    const by = new Map<OrderStatus, OrderView[]>(COLUMNS.map((c) => [c.status, []]));
    for (const o of orders) by.get(o.orderStatus)?.push(o);
    // Terminées : les plus récentes d'abord.
    by.get("completed")?.reverse();
    return by;
  }, [orders]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-rule px-3 md:px-5">
        <Link href="/admin" className="grid size-11 place-items-center text-sub hover:text-fg" aria-label="Retour au tableau de bord">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="font-serif text-2xl leading-none">Cuisine</h1>
        <span className={cn("ml-3 inline-flex items-center gap-2 text-xs font-semibold", online ? "text-[#7fd1a5]" : "text-[#f08a7e]")} aria-live="polite">
          <span className={cn("size-2 rounded-full", online ? "bg-[#5fb98a]" : "bg-[#f08a7e]")} />
          {online ? `À jour · ${formatParisTime(lastSync)}` : "Hors ligne — nouvelle tentative…"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" onClick={toggleSound} aria-pressed={sound} className={cn("inline-flex h-11 items-center gap-2 border px-3 text-[0.68rem] font-bold tracking-[0.14em] uppercase", sound ? "border-brass text-brass" : "border-rule text-sub")}>
            {sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
            <span className="hidden sm:inline">{sound ? "Son activé" : "Activer le son"}</span>
          </button>
          {push.supported && (
            <button
              type="button"
              onClick={() => void (push.subscribed ? push.test() : push.subscribe())}
              disabled={push.busy || !push.enabled}
              title={push.enabled ? undefined : "Clés VAPID non configurées"}
              className={cn("inline-flex h-11 items-center gap-2 border px-3 text-[0.68rem] font-bold tracking-[0.14em] uppercase disabled:opacity-40", push.subscribed ? "border-[#5fb98a]/60 text-[#7fd1a5]" : "border-rule text-sub")}
            >
              {push.subscribed ? <Bell className="size-4" aria-hidden /> : <BellOff className="size-4" aria-hidden />}
              <span className="hidden sm:inline">{push.subscribed ? "Tester" : "Notifications"}</span>
            </button>
          )}
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"} className="grid size-11 place-items-center border border-rule text-sub hover:text-fg">
            {fullscreen ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
          </button>
        </div>
      </header>

      {/* Onglets (téléphone) */}
      <div className="flex shrink-0 border-b border-rule md:hidden" role="tablist">
        {COLUMNS.map((c) => (
          <button key={c.status} type="button" role="tab" aria-selected={tab === c.status} onClick={() => setTab(c.status)} className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6rem] font-bold tracking-[0.12em] uppercase", tab === c.status ? "text-fg" : "text-sub")}>
            <span className="font-serif text-xl leading-none tabular-nums">{grouped.get(c.status)?.length ?? 0}</span>
            {c.label}
            <span className={cn("h-0.5 w-8", tab === c.status ? c.tone : "bg-transparent")} />
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-4">
        {COLUMNS.map((c) => {
          const list = grouped.get(c.status) ?? [];
          return (
            <section key={c.status} aria-label={c.label} className={cn("min-h-0 flex-col border-rule md:flex md:border-r last:md:border-r-0", tab === c.status ? "flex" : "hidden")}>
              <div className="hidden shrink-0 items-center justify-between px-4 pt-4 pb-3 md:flex">
                <h2 className="flex items-center gap-2.5 text-[0.72rem] font-bold tracking-[0.18em] uppercase">
                  <span className={cn("size-2.5 rounded-full", c.tone)} />
                  {c.label}
                </h2>
                <span className="font-serif text-2xl tabular-nums">{list.length}</span>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pt-3 pb-24 md:pt-0">
                <AnimatePresence initial={false}>
                  {list.map((o) => (
                    <OrderTicket key={o.id} order={o} now={now} highlight={flash.has(o.id)} onMove={move} compact={c.status === "completed"} />
                  ))}
                </AnimatePresence>
                {list.length === 0 && <p className="py-10 text-center text-sm text-sub/70">—</p>}
              </div>
            </section>
          );
        })}
      </div>
      <AdminNotices />
    </div>
  );
}

function OrderTicket({ order, now, highlight, onMove, compact }: { order: OrderView; now: number; highlight: boolean; onMove: (o: OrderView, to: OrderStatus) => void; compact: boolean }) {
  const next = NEXT[order.orderStatus];
  const back = BACK[order.orderStatus];
  const due = new Date(order.requestedTime).getTime();
  const minutesLeft = Math.round((due - now) / 60_000);
  const late = order.orderStatus !== "completed" && order.orderStatus !== "ready" && minutesLeft < 0;
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const toCollect = order.paymentStatus === "on_site";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className={cn("border bg-panel", highlight ? "border-rose shadow-[0_0_0_2px_rgba(216,160,175,0.5)]" : late ? "border-[#f08a7e]/70" : "border-rule", compact && "opacity-70")}
    >
      <header className="flex items-start justify-between gap-2 border-b border-rule px-3.5 pt-3 pb-2.5">
        <div className="min-w-0">
          <p className="font-serif text-[1.45rem] leading-none whitespace-nowrap tabular-nums xl:text-[1.65rem]">{order.orderNumber}</p>
          <p className="mt-1 truncate text-sm font-semibold">
            {order.customerFirstName} {order.customerLastName.charAt(0)}.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn("font-serif text-[1.45rem] leading-none tabular-nums xl:text-[1.65rem]", late && "text-[#f08a7e]")}>{formatParisTime(order.requestedTime)}</p>
          <p className="mt-1 text-[0.62rem] font-bold tracking-[0.1em] text-sub uppercase">{order.isAsap ? "Dès que possible" : "Heure choisie"}</p>
          {order.orderStatus !== "completed" && <p className={cn("text-[0.62rem] font-bold tracking-[0.1em] uppercase", late ? "text-[#f08a7e]" : "text-sub")}>{relative(minutesLeft)}</p>}
        </div>
      </header>

      {!compact && (
        <ul className="space-y-2.5 px-3.5 py-3">
          {order.items.map((it) => {
            const options = it.modifiers.filter((m) => m.name !== "Seul");
            return (
              <li key={it.id}>
                <p className="text-[1.02rem] leading-snug font-bold">
                  <span className="mr-1.5 inline-grid min-w-7 place-items-center bg-fg px-1 text-ink tabular-nums">{it.quantity}</span>
                  {it.productName}
                </p>
                {(options.length > 0 || it.removedIngredients.length > 0 || it.note) && (
                  <div className="mt-1 space-y-0.5 pl-9 text-[0.88rem] leading-snug">
                    {options.map((m, i) => (
                      <p key={i} className="text-fg/80">
                        {m.priceDeltaCents > 0 ? "+ " : ""}
                        {m.name}
                      </p>
                    ))}
                    {it.removedIngredients.map((r) => (
                      <p key={r} className="font-bold text-[#f08a7e]">
                        SANS {r.toUpperCase()}
                      </p>
                    ))}
                    {it.note && <p className="bg-brass/15 px-1.5 py-0.5 font-semibold text-brass">« {it.note} »</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {!compact && order.notes && <p className="mx-4 mb-3 border-l-2 border-brass bg-brass/10 px-3 py-2 text-[0.88rem] font-semibold text-brass">Note : {order.notes}</p>}

      <footer className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-rule px-3.5 py-2.5 text-sm">
        <span className="text-sub">
          {count} art. · <span className="tabular-nums text-fg">{formatPrice(order.totalCents)}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className={cn("text-[0.62rem] font-bold tracking-[0.1em] uppercase", toCollect ? "text-brass" : "text-[#7fd1a5]")}>{toCollect ? "À encaisser" : "Payée"}</span>
          <Link href={`/admin/orders/${order.orderNumber}`} className="text-[0.62rem] font-bold tracking-[0.1em] text-sub uppercase underline-offset-4 hover:text-fg hover:underline">
            Détail
          </Link>
        </span>
      </footer>

      {(back || next) && (
        <div className="flex gap-2 px-3 pb-3">
          {back && (
            <button type="button" onClick={() => onMove(order, back.to)} title={back.title} aria-label={back.title} className="h-12 shrink-0 border border-rule px-3 text-[0.62rem] font-bold tracking-[0.12em] text-sub uppercase hover:text-fg">
              {back.label}
            </button>
          )}
          {next && (
            <button type="button" onClick={() => onMove(order, next.to)} className="h-12 min-w-0 flex-1 bg-ivory px-2 text-[0.76rem] font-bold tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper active:scale-[0.99]">
              {next.label}
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
}
