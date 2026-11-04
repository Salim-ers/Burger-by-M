/**
 * Mode démonstration (présentation au restaurateur), 100 % dans le navigateur.
 *
 * Activé seulement sur l'appareil qui ouvre le site avec `?demo=1` ou depuis /demo (désactivé par
 * `?demo=0` ou le bouton « Quitter »). Aucune commande n'est envoyée au restaurant, aucun paiement n'a lieu,
 * aucune base n'est écrite : les commandes de démo vivent dans le localStorage, partagé entre les onglets
 * du même navigateur (un onglet « client » et un onglet « cuisine » se répondent).
 */
import { create } from "zustand";
import type { OrderStatus } from "@/db/schema";
import type { SlotsResponse } from "@/features/checkout/use-slots";
import type { PricedLine } from "@/features/menu/pricing";
import { toPublicOrder, type PublicOrder } from "@/features/orders/public";
import type { OrderView } from "@/features/orders/service";

const FLAG = "bym-demo";
const ORDERS = "bym-demo-orders";
const SETTINGS = "bym-demo-settings";
const CHANGE = "bym-demo-change";
/** Délai de préparation affiché en démo si le restaurant n'en a pas configuré. */
const DEFAULT_PREP_MINUTES = 20;

const storage = () => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

const emit = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE));
};

/** Prévient à chaque changement, dans cet onglet ou dans un autre onglet du même navigateur. */
export function subscribeDemo(listener: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(FLAG)) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE, listener);
  };
}

function readOrdersEnabled() {
  try {
    return (JSON.parse(storage()?.getItem(SETTINGS) ?? "{}") as { ordersEnabled?: boolean }).ordersEnabled !== false;
  } catch {
    return true;
  }
}

export const useDemo = create<{ active: boolean; ordersEnabled: boolean; sync: () => void; set: (on: boolean) => void; setOrdersEnabled: (on: boolean) => void }>()((set) => ({
  active: false,
  ordersEnabled: true,
  sync: () => set({ active: storage()?.getItem(FLAG) === "1", ordersEnabled: readOrdersEnabled() }),
  set: (on) => {
    const s = storage();
    if (on) s?.setItem(FLAG, "1");
    else {
      s?.removeItem(FLAG);
      s?.removeItem(ORDERS);
      s?.removeItem(SETTINGS);
    }
    set({ active: on, ordersEnabled: on ? readOrdersEnabled() : true });
    emit();
  },
  setOrdersEnabled: (on) => {
    storage()?.setItem(SETTINGS, JSON.stringify({ ordersEnabled: on }));
    set({ ordersEnabled: on });
    emit();
  },
}));

function readOrders(): OrderView[] {
  try {
    return JSON.parse(storage()?.getItem(ORDERS) ?? "[]") as OrderView[];
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderView[]) {
  storage()?.setItem(ORDERS, JSON.stringify(orders.slice(-40)));
  emit();
}

function update(id: string, patch: (o: OrderView) => Partial<OrderView>) {
  const now = new Date().toISOString();
  writeOrders(readOrders().map((o) => (o.id === id ? { ...o, ...patch(o), updatedAt: now } : o)));
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Créneaux de démo : toujours disponibles, même si le restaurant est fermé au moment de la présentation. */
export function demoSlots(prepMinutes: number | null): SlotsResponse {
  const prep = prepMinutes ?? DEFAULT_PREP_MINUTES;
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
  const slot = (date: Date) => ({ start: date.toISOString(), label: time.format(date), dayLabel: "Aujourd’hui", remaining: 3, available: true });
  const asap = new Date(Date.now() + prep * 60_000);
  const first = new Date(Math.ceil(asap.getTime() / (15 * 60_000)) * (15 * 60_000));
  return {
    canOrder: true,
    onlineOrderingEnabled: true,
    open: true,
    isOpen: true,
    nextOpening: null,
    prepMinutes: prep,
    asap: slot(asap),
    slots: Array.from({ length: 8 }, (_, i) => slot(new Date(first.getTime() + i * 15 * 60_000))),
    paymentMethods: ["card", "on_site"],
    minOrderCents: 0,
  };
}

export interface DemoOrderInput {
  customer: { firstName: string; lastName: string; phone: string; email?: string | null };
  requestedTime: string;
  isAsap: boolean;
  method: "card" | "on_site";
  notes?: string;
  lines: (Pick<PricedLine, "productName" | "quantity" | "unitPriceCents" | "lineTotalCents" | "removedIngredients" | "note"> & { modifiers: { groupName: string; name: string; priceDeltaCents: number }[] })[];
  /** Commande simulée depuis la cuisine : directement reçue, sans passer par le paiement. */
  received?: boolean;
}

export function createDemoOrder(input: DemoOrderInput): OrderView {
  const orders = readOrders();
  const now = new Date().toISOString();
  const totalCents = input.lines.reduce((n, l) => n + l.lineTotalCents, 0);
  const awaitingPayment = input.method === "card" && !input.received;
  const order: OrderView = {
    id: newId(),
    orderNumber: `M${1000 + orders.length + 1}`,
    customerFirstName: input.customer.firstName,
    customerLastName: input.customer.lastName,
    customerPhone: input.customer.phone,
    customerEmail: input.customer.email ?? null,
    requestedTime: input.requestedTime,
    isAsap: input.isAsap,
    notes: input.notes?.trim() || null,
    subtotalCents: totalCents,
    totalCents,
    paymentMethod: input.method,
    paymentStatus: input.method === "on_site" ? "on_site" : awaitingPayment ? "pending" : "authorized",
    orderStatus: awaitingPayment ? "payment_pending" : "new",
    createdAt: now,
    paidAt: null,
    acceptedAt: null,
    refusedAt: null,
    readyAt: null,
    updatedAt: now,
    cancelReason: null,
    items: input.lines.map((l) => ({
      id: newId(),
      productName: l.productName,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
      lineTotalCents: l.lineTotalCents,
      removedIngredients: l.removedIngredients,
      note: l.note,
      modifiers: l.modifiers.map((m) => ({ groupName: m.groupName, name: m.name, priceDeltaCents: m.priceDeltaCents })),
    })),
  };
  writeOrders([...orders, order]);
  return order;
}

export function getDemoOrder(id: string) {
  return readOrders().find((o) => o.id === id) ?? null;
}

/** Résultat de la page de paiement simulée. */
export function demoPayment(id: string, outcome: "authorized" | "failed" | "canceled") {
  if (outcome === "authorized") update(id, () => ({ orderStatus: "new", paymentStatus: "authorized" }));
  else update(id, () => ({ orderStatus: "cancelled", paymentStatus: outcome, cancelReason: "Paiement non finalisé" }));
}

/** Vue client, identique à celle du vrai suivi de commande. */
export function demoPublicOrder(id: string): PublicOrder | null {
  const order = getDemoOrder(id);
  if (!order) return null;
  const pub = toPublicOrder(order);
  return order.orderStatus === "payment_pending" ? { ...pub, resumePaymentUrl: `/demo/paiement/${order.id}` } : pub;
}

/* ---------------- Écran cuisine ---------------- */

const KITCHEN: OrderStatus[] = ["new", "preparing", "ready", "completed"];

export function demoKitchenOrders() {
  return { orders: readOrders().filter((o) => KITCHEN.includes(o.orderStatus)), serverTime: new Date().toISOString() };
}

export async function demoAccept(id: string) {
  const order = getDemoOrder(id);
  if (!order || order.orderStatus !== "new") return { ok: false, error: "La commande a changé entre-temps." };
  update(id, (o) => ({ orderStatus: "preparing", acceptedAt: new Date().toISOString(), ...(o.paymentStatus === "authorized" ? { paymentStatus: "paid" as const, paidAt: new Date().toISOString() } : {}) }));
  return { ok: true };
}

export async function demoRefuse(id: string, reason: string) {
  const order = getDemoOrder(id);
  if (!order) return { ok: false as const, error: "Commande introuvable." };
  const payment = order.paymentStatus === "authorized" ? ("released" as const) : order.paymentStatus === "paid" ? ("refunded" as const) : ("none" as const);
  update(id, (o) => ({ orderStatus: "cancelled", refusedAt: new Date().toISOString(), cancelReason: reason, paymentStatus: o.paymentStatus === "authorized" ? "canceled" : o.paymentStatus === "paid" ? "refunded" : o.paymentStatus }));
  return { ok: true as const, data: { payment } };
}

export async function demoSetStatus(id: string, from: OrderStatus, to: OrderStatus) {
  const order = getDemoOrder(id);
  if (!order || order.orderStatus !== from) return { ok: false, error: "La commande a changé entre-temps." };
  update(id, () => ({ orderStatus: to, ...(to === "ready" ? { readyAt: new Date().toISOString() } : {}) }));
  return { ok: true };
}
