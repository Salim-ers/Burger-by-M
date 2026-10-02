"use client";

/**
 * Store du back-office (mode démo).
 * Toutes les données vivent dans le navigateur (localStorage « bym-admin »).
 * En production, ces actions seront remplacées par les repositories branchés au backend
 * (voir lib/repositories) et par un canal temps réel.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminNotification, NewOrderInput, NotificationKind, Order, OrderStatus, Promotion } from "@/types/order";
import type { Product } from "@/types/product";
import type { WeekSchedule } from "@/data/opening-hours";
import { clickAndCollectHours, restaurantHours } from "@/data/opening-hours";
import { categories } from "@/data/categories";
import { orderingDefaults } from "@/data/restaurant";
import { buildDemoOrders, DEMO_BASKETS, DEMO_FIRST_NAMES } from "@/data/mock-orders";
import { buildItem, compactItems } from "@/lib/order-builder";
import { canTransition, cartSubtotal, formatOrderNumber } from "@/lib/order";
import { formatPrice } from "@/lib/currency";
import { formatTime } from "@/lib/hours";
import { uid } from "@/lib/utils";

export interface AdminSettings {
  acceptingOrders: boolean;
  rushMode: boolean;
  prepMinutes: number;
  rushPrepMinutes: number;
  slotIntervalMinutes: number;
  maxOrdersPerSlot: number;
  soundEnabled: boolean;
}

export type ProductOverride = Partial<
  Pick<Product, "name" | "slug" | "description" | "price" | "category" | "image" | "available" | "popular" | "vegetarian" | "spicy">
> & { badge?: string };

interface AdminState {
  /** DEMO AUTH ONLY — DO NOT USE IN PRODUCTION. Aucune vérification réelle. */
  session: { email: string; since: string } | null;
  orders: Order[];
  nextOrderNumber: number;
  settings: AdminSettings;
  productOverrides: Record<string, ProductOverride>;
  customProducts: Product[];
  categoryState: Record<string, { active: boolean; order: number }>;
  hours: { restaurant: WeekSchedule; clickAndCollect: WeekSchedule };
  promotions: Promotion[];
  notifications: AdminNotification[];

  login: (email: string) => void;
  logout: () => void;
  createOrder: (input: NewOrderInput, isDemo?: boolean) => Order;
  acceptOrder: (id: string, minutes: number) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  simulateOrder: () => Order;
  setSetting: <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => void;
  setProductAvailability: (id: string, available: boolean, name: string) => void;
  updateProduct: (id: string, patch: ProductOverride) => void;
  createProduct: (product: Product) => void;
  setCategoryActive: (id: string, active: boolean) => void;
  moveCategory: (id: string, direction: -1 | 1) => void;
  setHours: (kind: "restaurant" | "clickAndCollect", schedule: WeekSchedule) => void;
  addPromotion: (promo: Omit<Promotion, "id">) => void;
  togglePromotion: (id: string) => void;
  deletePromotion: (id: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const defaultSettings: AdminSettings = {
  acceptingOrders: true,
  rushMode: false,
  prepMinutes: orderingDefaults.prepMinutes,
  rushPrepMinutes: orderingDefaults.rushPrepMinutes,
  slotIntervalMinutes: orderingDefaults.slotIntervalMinutes,
  maxOrdersPerSlot: orderingDefaults.maxOrdersPerSlot,
  soundEnabled: false,
};

const defaultCategoryState = () =>
  Object.fromEntries(categories.map((c) => [c.id, { active: c.active, order: c.order }]));

function notification(kind: NotificationKind, title: string, body: string, orderId?: string): AdminNotification {
  return { id: uid("ntf"), kind, title, body, createdAt: new Date().toISOString(), read: false, orderId };
}

function initialData() {
  return {
    session: null,
    orders: buildDemoOrders(),
    nextOrderNumber: 1043,
    settings: defaultSettings,
    productOverrides: {},
    customProducts: [],
    categoryState: defaultCategoryState(),
    hours: { restaurant: structuredClone(restaurantHours), clickAndCollect: structuredClone(clickAndCollectHours) },
    promotions: [] as Promotion[],
    notifications: [] as AdminNotification[],
  };
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      login: (email) => set({ session: { email, since: new Date().toISOString() } }),
      logout: () => set({ session: null }),

      createOrder: (input, isDemo = false) => {
        const now = new Date().toISOString();
        const subtotal = cartSubtotal(input.items);
        const n = get().nextOrderNumber;
        const order: Order = {
          id: uid("ord"),
          number: formatOrderNumber(n),
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
          pickup: input.pickup,
          customer: input.customer,
          items: input.items,
          subtotal,
          discount: 0,
          total: subtotal,
          paymentMethod: input.paymentMethod,
          paymentStatus: "unpaid",
          notes: input.notes,
          isDemo,
        };
        set((s) => ({
          orders: [order, ...s.orders],
          nextOrderNumber: n + 1,
          notifications: [
            notification("new_order", `Nouvelle commande #${n}`, `${formatPrice(order.total)} · Retrait ${formatTime(order.pickup.time)}`, order.id),
            ...s.notifications,
          ].slice(0, 60),
        }));
        return order;
      },

      acceptOrder: (id, minutes) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id && canTransition(o.status, "ACCEPTED")
              ? { ...o, status: "ACCEPTED", announcedMinutes: minutes, updatedAt: new Date().toISOString() }
              : o,
          ),
        })),

      setOrderStatus: (id, status) =>
        set((s) => {
          const target = s.orders.find((o) => o.id === id);
          if (!target || !canTransition(target.status, status)) return s;
          const extra: AdminNotification[] = [];
          const num = target.number.replace("BYM-", "");
          if (status === "CANCELLED") extra.push(notification("order_cancelled", `Commande #${num} annulée`, `${target.customer.firstName} · ${formatPrice(target.total)}`, id));
          if (status === "READY") extra.push(notification("order_ready", `Commande #${num} prête`, `${target.customer.firstName} peut venir la récupérer`, id));
          return {
            orders: s.orders.map((o) =>
              o.id === id
                ? { ...o, status, updatedAt: new Date().toISOString(), paymentStatus: status === "COMPLETED" ? "paid" : o.paymentStatus }
                : o,
            ),
            notifications: [...extra, ...s.notifications].slice(0, 60),
          };
        }),

      simulateOrder: () => {
        const basket = DEMO_BASKETS[Math.floor(Math.random() * DEMO_BASKETS.length)] ?? DEMO_BASKETS[0]!;
        const first = DEMO_FIRST_NAMES[Math.floor(Math.random() * DEMO_FIRST_NAMES.length)] ?? "Client";
        const prep = get().settings.rushMode ? get().settings.rushPrepMinutes : get().settings.prepMinutes;
        const pickup = new Date(Date.now() + (prep + 10) * 60_000);
        pickup.setSeconds(0, 0);
        pickup.setMinutes(Math.ceil(pickup.getMinutes() / 5) * 5);
        return get().createOrder({
          customer: { firstName: first, lastName: "Démo", phone: "06 00 00 00 99", email: "demo@exemple.test", marketingOptIn: false },
          items: compactItems(basket.map((args) => buildItem(...args))),
          pickup: { mode: "scheduled", time: pickup.toISOString() },
          paymentMethod: "cash_on_pickup",
        }, true);
      },

      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),

      setProductAvailability: (id, available, name) =>
        set((s) => ({
          productOverrides: { ...s.productOverrides, [id]: { ...s.productOverrides[id], available } },
          notifications: available
            ? s.notifications
            : [notification("product_unavailable", "Produit indisponible", `${name} est passé en rupture`), ...s.notifications].slice(0, 60),
        })),

      updateProduct: (id, patch) =>
        set((s) => {
          if (s.customProducts.some((p) => p.id === id)) {
            return { customProducts: s.customProducts.map((p) => (p.id === id ? { ...p, ...patch, price: patch.price === undefined ? p.price : patch.price } : p)) };
          }
          return { productOverrides: { ...s.productOverrides, [id]: { ...s.productOverrides[id], ...patch } } };
        }),

      createProduct: (product) => set((s) => ({ customProducts: [...s.customProducts, product] })),

      setCategoryActive: (id, active) =>
        set((s) => ({ categoryState: { ...s.categoryState, [id]: { order: s.categoryState[id]?.order ?? 99, active } } })),

      moveCategory: (id, direction) =>
        set((s) => {
          const sorted = Object.entries(s.categoryState).sort((a, b) => a[1].order - b[1].order).map(([k]) => k);
          const i = sorted.indexOf(id);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= sorted.length) return s;
          [sorted[i], sorted[j]] = [sorted[j]!, sorted[i]!];
          const next: AdminState["categoryState"] = {};
          sorted.forEach((k, idx) => (next[k] = { active: s.categoryState[k]?.active ?? true, order: idx + 1 }));
          return { categoryState: next };
        }),

      setHours: (kind, schedule) => set((s) => ({ hours: { ...s.hours, [kind]: schedule } })),

      addPromotion: (promo) => set((s) => ({ promotions: [{ ...promo, id: uid("promo") }, ...s.promotions] })),
      togglePromotion: (id) => set((s) => ({ promotions: s.promotions.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })),
      deletePromotion: (id) => set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) })),

      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      resetDemo: () => set((s) => ({ ...initialData(), session: s.session })),
    }),
    {
      name: "bym-admin",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/** Temps de préparation effectif (mode coup de feu inclus). */
export function effectivePrepMinutes(settings: AdminSettings) {
  return settings.rushMode ? settings.rushPrepMinutes : settings.prepMinutes;
}
