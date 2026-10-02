"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, PickupChoice, SelectedOption } from "@/types/cart";
import type { Cents } from "@/types/product";
import { lineIdFor } from "@/lib/order";

const MAX_QTY = 20;

interface CartState {
  items: CartItem[];
  pickup: PickupChoice;
  /** Incrémenté à chaque ajout : déclenche le rebond de l'icône panier. */
  bump: number;
  addItem: (item: Omit<CartItem, "lineId">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  updateOptions: (lineId: string, options: SelectedOption[], unitPrice: Cents) => void;
  clearCart: () => void;
  setPickup: (pickup: PickupChoice) => void;
}

const clampQty = (q: number) => Math.max(1, Math.min(MAX_QTY, Math.trunc(q)));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      pickup: { mode: "asap" },
      bump: 0,
      addItem: (item) =>
        set((s) => {
          const lineId = lineIdFor(item.productId, item.options);
          const existing = s.items.find((i) => i.lineId === lineId);
          const items = existing
            ? s.items.map((i) => (i.lineId === lineId ? { ...i, quantity: clampQty(i.quantity + item.quantity) } : i))
            : [...s.items, { ...item, quantity: clampQty(item.quantity), lineId }];
          return { items, bump: s.bump + 1 };
        }),
      removeItem: (lineId) => set((s) => ({ items: s.items.filter((i) => i.lineId !== lineId) })),
      updateQuantity: (lineId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.lineId !== lineId)
              : s.items.map((i) => (i.lineId === lineId ? { ...i, quantity: clampQty(quantity) } : i)),
        })),
      updateOptions: (lineId, options, unitPrice) =>
        set((s) => {
          const current = s.items.find((i) => i.lineId === lineId);
          if (!current) return s;
          const newId = lineIdFor(current.productId, options);
          const others = s.items.filter((i) => i.lineId !== lineId);
          const twin = others.find((i) => i.lineId === newId);
          if (twin) {
            return { items: others.map((i) => (i.lineId === newId ? { ...i, quantity: clampQty(i.quantity + current.quantity) } : i)) };
          }
          return {
            items: s.items.map((i) => (i.lineId === lineId ? { ...i, options, unitPrice, lineId: newId } : i)),
          };
        }),
      clearCart: () => set({ items: [] }),
      setPickup: (pickup) => set({ pickup }),
    }),
    {
      name: "bym-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, pickup: s.pickup }),
      skipHydration: true,
    },
  ),
);
