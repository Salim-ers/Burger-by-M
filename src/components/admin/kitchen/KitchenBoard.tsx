"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Maximize, Minimize } from "lucide-react";
import type { OrderStatus } from "@/db/schema";
import type { OrderView } from "@/features/orders/service";
import { acceptOrderAction, refuseOrderAction, setOrderStatusAction } from "@/features/admin/actions/orders";
import { Logo, Wordmark } from "@/components/brand/Logo";
import { formatPrice } from "@/lib/money";
import { formatParisTime } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { AdminNotices, useNotify } from "../ui";
import { REFUSAL_REASONS } from "../OrderActions";
import { usePushSubscription } from "./use-push";
import { playChime, playTick, unlockAudio } from "./chime";

type Column = { status: Extract<OrderStatus, "new" | "preparing" | "ready">; label: string; dot: string };

const COLUMNS: Column[] = [
  { status: "new", label: "Nouvelles", dot: "bg-cheddar" },
  { status: "preparing", label: "En préparation", dot: "bg-cream" },
  { status: "ready", label: "Prêtes", dot: "bg-open" },
];

const POLL_MS = 5_000;
/** Rappel sonore tant qu'une commande attend d'être acceptée. */
const REMINDER_MS = 45_000;
const SERVICE_KEY = "bym-service";

type WakeState = "idle" | "active" | "unsupported" | "failed";
type NotifState = NotificationPermission | "unsupported";

/** « dans 12 min », « dans 1 h 05 », « 8 min de retard ». */
function relative(minutes: number) {
  if (minutes < 0) return `${-minutes} min de retard`;
  if (minutes === 0) return "maintenant";
  if (minutes < 60) return `dans ${minutes} min`;
  return `dans ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

function since(iso: string, now: number) {
  const m = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  return m === 0 ? "à l’instant" : m < 60 ? `il y a ${m} min` : `il y a ${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

/**
 * Écran cuisine (tablette) : DÉMARRER LE SERVICE (son, notifications, écran allumé), puis
 * NOUVELLES → EN PRÉPARATION → PRÊTES. Rafraîchissement continu (polling, en plus du push) :
 * une coupure réseau ne fait jamais perdre une commande, elle s'affiche au retour de la connexion.
 */
export function KitchenBoard({ initial, initialServerTime }: { initial: OrderView[]; initialServerTime: string }) {
  const notify = useNotify();
  const push = usePushSubscription();
  const [orders, setOrders] = useState(initial);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(initialServerTime);
  const [started, setStarted] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [sound, setSound] = useState(true);
  const [wake, setWake] = useState<WakeState>("idle");
  const [notif, setNotif] = useState<NotifState>("default");
  const [tab, setTab] = useState<Column["status"]>("new");
  const [fullscreen, setFullscreen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [flashKey, setFlashKey] = useState(0);
  const [refusing, setRefusing] = useState<OrderView | null>(null);
  const [showDone, setShowDone] = useState(false);
  const known = useRef(new Set(initial.map((o) => o.id)));
  const live = useRef({ started: false, sound: true });
  const inFlight = useRef(new Set<string>());
  const lock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    live.current = { started, sound };
  }, [started, sound]);

  useEffect(() => {
    setNotif("Notification" in window ? Notification.permission : "unsupported");
    try {
      setResumed(sessionStorage.getItem(SERVICE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------------- Alerte nouvelle commande ---------------- */

  const alertNew = useCallback(
    (list: OrderView[]) => {
      if (!live.current.started) return;
      setFresh((f) => new Set([...f, ...list.map((o) => o.id)]));
      window.setTimeout(() => setFresh((f) => new Set([...f].filter((id) => !list.some((o) => o.id === id)))), 15_000);
      setFlashKey((k) => k + 1);
      if (live.current.sound) playChime();
      notify(list.length === 1 ? `Nouvelle commande ${list[0]!.orderNumber} — ${formatPrice(list[0]!.totalCents)}` : `${list.length} nouvelles commandes`);
      if ("Notification" in window && Notification.permission === "granted") {
        for (const o of list) {
          const title = `Nouvelle commande ${o.orderNumber}`;
          const options: NotificationOptions = { body: `${o.customerFirstName} · ${formatPrice(o.totalCents)} · retrait ${formatParisTime(o.requestedTime)}`, tag: o.orderNumber, icon: "/icons/icon-192.png", data: { url: "/admin/cuisine" } };
          const show = async () => {
            const reg = await navigator.serviceWorker?.getRegistration("/admin/");
            if (reg) await reg.showNotification(title, options);
            else new Notification(title, options);
          };
          void show().catch(() => undefined);
        }
      }
    },
    [notify],
  );

  /* ---------------- Synchronisation ---------------- */

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/kitchen", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin/login?next=/admin/cuisine";
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { orders: OrderView[]; serverTime: string };
      const arrived = body.orders.filter((o) => !known.current.has(o.id) && o.orderStatus === "new");
      body.orders.forEach((o) => known.current.add(o.id));
      if (arrived.length) alertNew(arrived);
      // Les commandes en cours de modification gardent leur état local jusqu'à la réponse du serveur.
      setOrders((prev) => body.orders.map((o) => (inFlight.current.has(o.id) ? (prev.find((p) => p.id === o.id) ?? o) : o)));
      setLastSync(body.serverTime);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [alertNew]);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    const onMessage = (e: MessageEvent) => (e.data as { type?: string } | null)?.type === "push" && void refresh();
    const onOnline = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(id);
  }, []);

  // Rappel sonore : une commande attend toujours d'être acceptée.
  const waiting = orders.filter((o) => o.orderStatus === "new").length;
  useEffect(() => {
    if (!started || !sound || waiting === 0) return;
    const id = window.setInterval(() => playChime(), REMINDER_MS);
    return () => window.clearInterval(id);
  }, [started, sound, waiting]);

  /* ---------------- Écran allumé (Wake Lock) ---------------- */

  const requestWake = useCallback(async () => {
    if (!("wakeLock" in navigator)) return setWake("unsupported");
    if (document.visibilityState !== "visible") return;
    try {
      lock.current = await navigator.wakeLock.request("screen");
      setWake("active");
      lock.current.addEventListener("release", () => setWake((w) => (w === "active" ? "idle" : w)));
    } catch {
      setWake("failed");
    }
  }, []);

  useEffect(() => {
    if (!started) return;
    const onVisible = () => document.visibilityState === "visible" && void requestWake();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [started, requestWake]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ---------------- Service ---------------- */

  const start = async () => {
    unlockAudio();
    playTick();
    setStarted(true);
    try {
      sessionStorage.setItem(SERVICE_KEY, "1");
    } catch {
      /* ignore */
    }
    void requestWake();
    if ("Notification" in window) {
      const permission = Notification.permission === "default" ? await Notification.requestPermission().catch(() => "default" as const) : Notification.permission;
      setNotif(permission);
      if (permission === "granted" && push.enabled && !push.subscribed) void push.subscribe();
    } else setNotif("unsupported");
  };

  const stop = () => {
    if (!window.confirm("Terminer le service ? L’écran ne sonnera plus pour les nouvelles commandes.")) return;
    setStarted(false);
    void lock.current?.release().catch(() => undefined);
    lock.current = null;
    setWake("idle");
    try {
      sessionStorage.removeItem(SERVICE_KEY);
    } catch {
      /* ignore */
    }
  };

  const toggleSound = () => {
    const next = !sound;
    if (next) {
      unlockAudio();
      playTick();
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

  /* ---------------- Actions ---------------- */

  const optimistic = async (order: OrderView, to: OrderStatus, call: () => Promise<{ ok: boolean; error?: string }>, success?: string) => {
    if (inFlight.current.has(order.id)) return false;
    inFlight.current.add(order.id);
    const from = order.orderStatus;
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, orderStatus: to } : o)));
    const r = await call().catch(() => ({ ok: false, error: "Connexion perdue : action non enregistrée." }));
    inFlight.current.delete(order.id);
    if (!r.ok) {
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, orderStatus: from } : o)));
      notify(r.error ?? "Action impossible.", "error");
    } else if (success) notify(success);
    void refresh();
    return r.ok;
  };

  const accept = (o: OrderView) => optimistic(o, "preparing", () => acceptOrderAction(o.id), o.paymentStatus === "authorized" ? `${o.orderNumber} acceptée · paiement encaissé` : `${o.orderNumber} acceptée`);
  const move = (o: OrderView, to: OrderStatus) => optimistic(o, to, () => setOrderStatusAction(o.id, o.orderStatus, to));

  const refuse = async (o: OrderView, reason: string) => {
    if (inFlight.current.has(o.id)) return;
    inFlight.current.add(o.id);
    const r = await refuseOrderAction(o.id, reason).catch(() => ({ ok: false as const, error: "Connexion perdue : refus non enregistré." }));
    inFlight.current.delete(o.id);
    if (!r.ok) {
      notify(r.error, "error");
      return;
    }
    setRefusing(null);
    setOrders((list) => list.filter((x) => x.id !== o.id));
    const payment = r.data?.payment;
    if (payment === "failed") notify(`${o.orderNumber} refusée, mais le paiement n’a pas pu être libéré : vérifiez dans Mollie.`, "error");
    else notify(`${o.orderNumber} refusée${payment === "released" ? " · réservation carte levée" : payment === "refunded" ? " · client remboursé" : ""}`);
    void refresh();
  };

  const grouped = useMemo(() => {
    const by = new Map<OrderStatus, OrderView[]>([
      ["new", []],
      ["preparing", []],
      ["ready", []],
      ["completed", []],
    ]);
    for (const o of orders) by.get(o.orderStatus)?.push(o);
    by.get("completed")?.reverse();
    return by;
  }, [orders]);
  const count = (s: OrderStatus) => grouped.get(s)?.length ?? 0;
  const clock = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(now);

  if (!started) {
    return <StartScreen onStart={start} resumed={resumed} waiting={count("new")} active={count("preparing") + count("ready")} online={online} notif={notif} />;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink">
      <AnimatePresence>
        {flashKey > 0 && <motion.div key={flashKey} aria-hidden className="pointer-events-none fixed inset-0 z-[70] bg-cream" initial={{ opacity: 0.22 }} animate={{ opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} />}
      </AnimatePresence>

      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-rule px-3 py-2.5 md:px-5 xl:gap-x-4">
        <Link href="/admin" className="grid size-11 place-items-center text-sub hover:text-fg" aria-label="Retour à l’administration">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.16em] text-open uppercase">
            <span className="relative size-2.5 rounded-full bg-open">
              <span className="absolute inset-0 animate-ping rounded-full bg-open/60 motion-reduce:hidden" />
            </span>
            Service actif
          </span>
          <span className="font-display text-[1.9rem] leading-none tabular-nums">{clock}</span>
        </div>
        <span className={cn("text-[0.68rem] font-bold tracking-[0.12em] uppercase", online ? "hidden text-sub xl:inline" : "text-closed")} aria-live="polite">
          {online ? `À jour · ${formatParisTime(lastSync)}` : "Hors ligne — nouvelle tentative…"}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5 max-md:w-full max-md:justify-between">
          <Chip on={sound} onClick={toggleSound} pressed={sound}>
            Son {sound ? "on" : "off"}
          </Chip>
          <Chip on={wake === "active"} warn={wake === "failed" || wake === "unsupported"} onClick={wake === "active" ? undefined : () => void requestWake()} title={wake === "active" ? "L’écran ne se mettra pas en veille" : "Mise en veille possible : désactivez-la dans les réglages de la tablette"}>
            {wake === "active" ? "Écran actif" : "Veille possible"}
          </Chip>
          <Chip
            on={notif === "granted"}
            warn={notif === "denied"}
            onClick={notif === "default" ? () => void Notification.requestPermission().then(setNotif) : push.subscribed ? () => void push.test() : undefined}
            title={notif === "denied" ? "Notifications bloquées dans les réglages du navigateur" : undefined}
          >
            {notif === "granted" ? "Notif." : notif === "denied" ? "Notif. bloquées" : notif === "unsupported" ? "Sans notif." : "Activer notif."}
          </Chip>
          <button type="button" onClick={() => setShowDone(true)} aria-label={`Commandes récupérées : ${count("completed")}`} className="h-11 border border-rule px-3 text-[0.68rem] font-bold tracking-[0.12em] text-sub uppercase hover:text-fg">
            Récup. · {count("completed")}
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"} className="grid size-11 place-items-center border border-rule text-sub hover:text-fg">
            {fullscreen ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
          </button>
          <button type="button" onClick={stop} className="h-11 border border-rule px-3 text-[0.68rem] font-bold tracking-[0.12em] text-sub uppercase hover:border-closed hover:text-closed">
            Terminer
          </button>
        </div>
      </header>

      {!online && (
        <p role="alert" className="shrink-0 bg-closed px-4 py-2 text-center text-sm font-bold text-ink">
          Connexion perdue : les commandes s’afficheront dès le retour du réseau. Aucune commande n’est perdue.
        </p>
      )}

      {/* Onglets (téléphone) */}
      <div className="flex shrink-0 border-b border-rule md:hidden" role="tablist">
        {COLUMNS.map((c) => (
          <button key={c.status} type="button" role="tab" aria-selected={tab === c.status} onClick={() => setTab(c.status)} className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.62rem] font-bold tracking-[0.12em] uppercase", tab === c.status ? "text-fg" : "text-sub")}>
            <span className="font-display text-2xl leading-none tabular-nums">{count(c.status)}</span>
            {c.label}
            <span className={cn("h-0.5 w-8", tab === c.status ? c.dot : "bg-transparent")} />
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-3">
        {COLUMNS.map((c) => {
          const list = grouped.get(c.status) ?? [];
          return (
            <section key={c.status} aria-label={c.label} className={cn("min-h-0 flex-col border-rule md:flex md:border-r last:md:border-r-0", tab === c.status ? "flex" : "hidden", c.status === "new" && list.length > 0 && "bg-cheddar/[0.04]")}>
              <div className="hidden shrink-0 items-center justify-between px-4 pt-4 pb-3 md:flex">
                <h2 className="flex items-center gap-2.5 text-[0.78rem] font-bold tracking-[0.18em] uppercase">
                  <span className={cn("size-2.5 rounded-full", c.dot)} />
                  {c.label}
                </h2>
                <span className={cn("font-display text-[2.2rem] leading-none tabular-nums", c.status === "new" && list.length > 0 && "text-cheddar")}>{list.length}</span>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pt-3 pb-24 md:pt-0">
                <AnimatePresence initial={false}>
                  {list.map((o) => (
                    <Ticket key={o.id} order={o} now={now} highlight={fresh.has(o.id)} onAccept={accept} onRefuse={setRefusing} onMove={move} />
                  ))}
                </AnimatePresence>
                {list.length === 0 && <p className="py-14 text-center text-sm text-sub/60">{c.status === "new" ? "En attente de commandes" : "—"}</p>}
              </div>
            </section>
          );
        })}
      </div>

      <AnimatePresence>{refusing && <RefuseDialog order={refusing} onCancel={() => setRefusing(null)} onConfirm={(reason) => refuse(refusing, reason)} />}</AnimatePresence>
      <AnimatePresence>{showDone && <DoneDrawer orders={grouped.get("completed") ?? []} onClose={() => setShowDone(false)} onReopen={(o) => void move(o, "ready")} />}</AnimatePresence>
      <AdminNotices />
    </div>
  );
}

/* ---------------- Démarrage du service ---------------- */

function StartScreen({ onStart, resumed, waiting, active, online, notif }: { onStart: () => void; resumed: boolean; waiting: number; active: number; online: boolean; notif: NotifState }) {
  return (
    <div className="flex min-h-dvh flex-col bg-ink px-5 py-6 md:px-10">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-sub uppercase hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> Administration
        </Link>
        <span className={cn("text-[0.68rem] font-bold tracking-[0.12em] uppercase", online ? "text-sub" : "text-closed")}>{online ? "Connecté" : "Hors ligne"}</span>
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
        <Logo size={112} priority />
        <p className="mt-8 text-[0.8rem] font-bold tracking-[0.3em] text-sub uppercase">
          <Wordmark className="text-[1rem] text-fg" /> · Cuisine
        </p>
        <h1 className="mt-6 font-display text-[clamp(2.6rem,7vw,4.5rem)] leading-[0.95] uppercase">{resumed ? "Reprendre le service" : "Démarrer le service"}</h1>
        {(waiting > 0 || active > 0) && (
          <p className="mt-6 text-lg font-semibold">
            {waiting > 0 && <span className="text-cheddar">{waiting} nouvelle{waiting > 1 ? "s" : ""} commande{waiting > 1 ? "s" : ""} en attente</span>}
            {waiting > 0 && active > 0 && " · "}
            {active > 0 && `${active} en cours`}
          </p>
        )}
        <button type="button" onClick={onStart} className="mt-10 h-24 w-full max-w-xl bg-cheddar font-display text-[2rem] tracking-[0.04em] text-ink uppercase transition-colors hover:bg-cream active:scale-[0.99]">
          {resumed ? "Reprendre" : "Démarrer"}
        </button>
        <ul className="mt-10 grid w-full max-w-xl gap-2 text-left text-sm text-fg/80 sm:grid-cols-3">
          <li className="border border-rule px-4 py-3">
            <span className="block font-bold text-fg">Son</span>
            Activé au démarrage, rappel tant qu’une commande attend.
          </li>
          <li className="border border-rule px-4 py-3">
            <span className="block font-bold text-fg">Notifications</span>
            {notif === "granted" ? "Autorisées sur cet appareil." : notif === "denied" ? "Bloquées : à autoriser dans le navigateur." : notif === "unsupported" ? "Non disponibles sur ce navigateur." : "Autorisation demandée au démarrage."}
          </li>
          <li className="border border-rule px-4 py-3">
            <span className="block font-bold text-fg">Écran</span>
            Maintenu allumé pendant le service si l’appareil le permet.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Chip({ on, warn, onClick, pressed, title, children }: { on: boolean; warn?: boolean; onClick?: () => void; pressed?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={pressed}
      title={title}
      className={cn("inline-flex h-11 items-center gap-2 border px-3 text-[0.68rem] font-bold tracking-[0.12em] uppercase disabled:cursor-default", on ? "border-open/60 text-open" : warn ? "border-closed/60 text-closed" : "border-rule text-sub hover:text-fg")}
    >
      <span className={cn("size-1.5 rounded-full", on ? "bg-open" : warn ? "bg-closed" : "bg-sub")} aria-hidden />
      {children}
    </button>
  );
}

/* ---------------- Ticket ---------------- */

function paymentTag(o: OrderView) {
  if (o.paymentMethod === "on_site") return { label: "À encaisser au comptoir", tone: "text-cheddar" };
  if (o.paymentStatus === "authorized") return { label: "CB réservée · encaissée à l’acceptation", tone: "text-cheddar" };
  if (o.paymentStatus === "paid") return { label: "Payée en ligne", tone: "text-open" };
  if (o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded") return { label: "Remboursée", tone: "text-sub" };
  return { label: "Paiement à vérifier", tone: "text-closed" };
}

function Ticket({ order, now, highlight, onAccept, onRefuse, onMove }: { order: OrderView; now: number; highlight: boolean; onAccept: (o: OrderView) => void; onRefuse: (o: OrderView) => void; onMove: (o: OrderView, to: OrderStatus) => void }) {
  const due = new Date(order.requestedTime).getTime();
  const minutesLeft = Math.round((due - now) / 60_000);
  const late = (order.orderStatus === "new" || order.orderStatus === "preparing") && minutesLeft < 0;
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const pay = paymentTag(order);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className={cn("border bg-charcoal", highlight ? "border-cheddar shadow-[0_0_0_3px_rgba(231,154,36,0.35)]" : late ? "border-closed/70" : "border-rule")}
    >
      <header className="flex items-start justify-between gap-3 border-b border-dashed border-rule px-4 pt-3.5 pb-3">
        <div className="min-w-0">
          <p className="font-display text-[2rem] leading-none whitespace-nowrap tabular-nums">
            <span className="text-sub">#</span>
            {order.orderNumber}
          </p>
          <p className="mt-1.5 truncate text-[0.95rem] font-semibold">
            {order.customerFirstName} {order.customerLastName.charAt(0)}.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn("font-display text-[2rem] leading-none tabular-nums", late && "text-closed")}>{formatParisTime(order.requestedTime)}</p>
          <p className={cn("mt-1.5 text-[0.66rem] font-bold tracking-[0.1em] uppercase", late ? "text-closed" : "text-sub")}>
            {order.isAsap ? "Dès que possible · " : ""}
            {relative(minutesLeft)}
          </p>
        </div>
      </header>

      <ul className="space-y-3 px-4 py-3.5">
        {order.items.map((it) => {
          const options = it.modifiers.filter((m) => m.name !== "Seul");
          return (
            <li key={it.id}>
              <p className="text-[1.08rem] leading-snug font-bold">
                <span className="mr-2 inline-grid min-w-8 place-items-center bg-cream px-1 text-ink tabular-nums">{it.quantity}</span>
                {it.productName}
              </p>
              {(options.length > 0 || it.removedIngredients.length > 0 || it.note) && (
                <div className="mt-1.5 space-y-0.5 pl-10 text-[0.95rem] leading-snug">
                  {it.removedIngredients.map((r) => (
                    <p key={r} className="font-bold text-closed">
                      − sans {r.toLowerCase()}
                    </p>
                  ))}
                  {options.map((m, i) => (
                    <p key={i} className={m.priceDeltaCents > 0 ? "font-semibold text-cheddar" : "text-fg/80"}>
                      {m.priceDeltaCents > 0 ? "+ " : ""}
                      {m.name}
                    </p>
                  ))}
                  {it.note && <p className="bg-cheddar/15 px-1.5 py-0.5 font-semibold text-cheddar">« {it.note} »</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {order.notes && <p className="mx-4 mb-3 border-l-2 border-cheddar bg-cheddar/10 px-3 py-2 text-[0.92rem] font-semibold text-cheddar">Note : {order.notes}</p>}

      <footer className="border-t border-dashed border-rule px-4 py-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sub">
            {count} article{count > 1 ? "s" : ""} · reçue {since(order.createdAt, now)}
          </span>
          <span className="font-display text-xl tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className={cn("text-[0.66rem] font-bold tracking-[0.1em] uppercase", pay.tone)}>{pay.label}</span>
          <Link href={`/admin/orders/${order.orderNumber}`} className="text-[0.66rem] font-bold tracking-[0.1em] text-sub uppercase underline-offset-4 hover:text-fg hover:underline">
            Détail
          </Link>
        </div>
      </footer>

      <div className="flex gap-2 px-3 pb-3">
        {order.orderStatus === "new" && (
          <>
            <button type="button" onClick={() => onRefuse(order)} className="h-16 shrink-0 border border-closed/60 px-4 text-[0.78rem] font-bold tracking-[0.14em] text-closed uppercase hover:bg-closed/10 lg:h-[4.5rem]">
              Refuser
            </button>
            <button type="button" onClick={() => onAccept(order)} className="h-16 min-w-0 flex-1 bg-cheddar px-2 font-display text-[1.6rem] tracking-[0.04em] text-ink uppercase transition-colors hover:bg-cream active:scale-[0.99] lg:h-[4.5rem]">
              Accepter
            </button>
          </>
        )}
        {order.orderStatus === "preparing" && (
          <button type="button" onClick={() => onMove(order, "ready")} className="h-16 min-w-0 flex-1 bg-cream px-2 font-display text-[1.6rem] tracking-[0.04em] text-ink uppercase transition-colors hover:bg-cheddar active:scale-[0.99] lg:h-[4.5rem]">
            Prête
          </button>
        )}
        {order.orderStatus === "ready" && (
          <>
            <button type="button" onClick={() => onMove(order, "preparing")} title="Remettre en préparation" className="h-16 shrink-0 border border-rule px-4 text-[0.72rem] font-bold tracking-[0.12em] text-sub uppercase hover:text-fg lg:h-[4.5rem]">
              Retour
            </button>
            <button type="button" onClick={() => onMove(order, "completed")} className="h-16 min-w-0 flex-1 bg-open px-2 font-display text-[1.6rem] tracking-[0.04em] text-ink uppercase transition-colors hover:bg-cream active:scale-[0.99] lg:h-[4.5rem]">
              Terminer
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
}

/* ---------------- Refus ---------------- */

function RefuseDialog({ order, onCancel, onConfirm }: { order: OrderView; onCancel: () => void; onConfirm: (reason: string) => Promise<void> | void }) {
  const [reason, setReason] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (reason.trim().length < 2 || busy) return;
    setBusy(true);
    await onConfirm(reason.trim());
    setBusy(false);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  const money = order.paymentStatus === "authorized" ? "La réservation sur la carte du client sera levée : rien ne sera débité." : order.paymentStatus === "paid" ? "Le client sera remboursé intégralement." : "Aucun paiement en ligne à annuler.";
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-3 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="refuse-title" className="w-full max-w-xl border border-rule bg-charcoal p-6" initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: 24 }}>
        <p className="text-[0.7rem] font-bold tracking-[0.16em] text-closed uppercase">Refuser la commande</p>
        <h2 id="refuse-title" className="mt-2 font-display text-[2.4rem] leading-none">
          #{order.orderNumber}
        </h2>
        <p className="mt-3 text-sm text-fg/80">{money} Le client voit « Votre commande n’a pas pu être acceptée » sur sa page de suivi.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {REFUSAL_REASONS.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)} aria-pressed={reason === r} className={cn("h-16 border px-3 text-left text-[0.95rem] font-semibold transition-colors", reason === r ? "border-cream bg-cream text-ink" : "border-rule hover:border-fg/60")}>
              {r}
            </button>
          ))}
        </div>
        <input value={REFUSAL_REASONS.includes(reason as (typeof REFUSAL_REASONS)[number]) ? "" : reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Autre motif…" aria-label="Autre motif" className="mt-2 h-14 w-full border border-rule bg-ink px-4 text-[1rem] outline-none focus:border-fg/70" />
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="h-16 flex-1 border border-rule text-[0.8rem] font-bold tracking-[0.14em] uppercase hover:border-fg/60">
            Annuler
          </button>
          <button type="button" onClick={() => void confirm()} disabled={reason.trim().length < 2 || busy} className="h-16 flex-[1.4] bg-closed font-display text-[1.5rem] text-ink uppercase disabled:opacity-40">
            {busy ? "Refus…" : "Refuser"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Récupérées ---------------- */

function DoneDrawer({ orders, onClose, onReopen }: { orders: OrderView[]; onClose: () => void; onReopen: (o: OrderView) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[85] flex justify-end bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside role="dialog" aria-modal="true" aria-label="Commandes récupérées" className="flex h-full w-[min(420px,92vw)] flex-col border-l border-rule bg-charcoal" initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 className="text-[0.78rem] font-bold tracking-[0.18em] uppercase">Récupérées aujourd’hui · {orders.length}</h2>
          <button type="button" onClick={onClose} className="h-11 px-3 text-[0.7rem] font-bold tracking-[0.12em] uppercase hover:text-cheddar">
            Fermer ✕
          </button>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-rule overflow-y-auto">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="font-display text-xl leading-none tabular-nums">#{o.orderNumber}</p>
                <p className="mt-1 text-sm text-sub">
                  {o.customerFirstName} · {formatPrice(o.totalCents)}
                </p>
              </div>
              <button type="button" onClick={() => onReopen(o)} className="h-11 border border-rule px-3 text-[0.68rem] font-bold tracking-[0.12em] uppercase hover:border-fg/60">
                Rouvrir
              </button>
            </li>
          ))}
          {orders.length === 0 && <li className="px-5 py-10 text-center text-sm text-sub">Aucune commande récupérée.</li>}
        </ul>
      </motion.aside>
    </motion.div>
  );
}
