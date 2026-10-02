"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CheckoutState {
  lastOrderId: string | null;
  setLastOrder: (id: string) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      lastOrderId: null,
      setLastOrder: (lastOrderId) => set({ lastOrderId }),
    }),
    { name: "bym-checkout", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
