"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { lineKey, MAX_QUANTITY } from "@/features/menu/pricing";

/**
 * Panier persistant (localStorage). Il ne contient que des identifiants et un aperçu d'affichage :
 * le serveur revalide tout et recalcule les prix depuis Neon au moment de commander.
 */
export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: { src: string; alt: string; position?: string } | null;
  quantity: number;
  modifierIds: string[];
  removedIngredientIds: string[];
  note?: string;
  /** Aperçu (recalculé à l'affichage depuis la carte à jour). */
  unitPriceCents: number;
  details: string[];
}

interface CartState {
  lines: CartLine[];
  /** Incrémenté à chaque ajout (animation du compteur). */
  bump: number;
  add: (line: Omit<CartLine, "key">) => void;
  replace: (key: string, line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const clamp = (q: number) => Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(q)));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      bump: 0,
      add: (line) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing ? s.lines.map((l) => (l.key === key ? { ...l, quantity: clamp(l.quantity + line.quantity) } : l)) : [...s.lines, { ...line, quantity: clamp(line.quantity), key }];
          return { lines, bump: s.bump + 1 };
        }),
      replace: (oldKey, line) =>
        set((s) => {
          const key = lineKey(line);
          const others = s.lines.filter((l) => l.key !== oldKey);
          const twin = others.find((l) => l.key === key);
          if (twin) return { lines: others.map((l) => (l.key === key ? { ...l, quantity: clamp(l.quantity + line.quantity) } : l)) };
          const index = s.lines.findIndex((l) => l.key === oldKey);
          const next = [...others];
          next.splice(index < 0 ? next.length : index, 0, { ...line, quantity: clamp(line.quantity), key });
          return { lines: next };
        }),
      setQuantity: (key, quantity) => set((s) => ({ lines: quantity <= 0 ? s.lines.filter((l) => l.key !== key) : s.lines.map((l) => (l.key === key ? { ...l, quantity: clamp(quantity) } : l)) })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "bym-cart-v2",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      skipHydration: true,
    },
  ),
);

export function cartCount(lines: Pick<CartLine, "quantity">[]) {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

interface UiState {
  sheet: { productId: string; editKey?: string } | null;
  cartOpen: boolean;
  openProduct: (productId: string, editKey?: string) => void;
  closeProduct: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  sheet: null,
  cartOpen: false,
  openProduct: (productId, editKey) => set({ sheet: { productId, editKey }, cartOpen: false }),
  closeProduct: () => set({ sheet: null }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));
