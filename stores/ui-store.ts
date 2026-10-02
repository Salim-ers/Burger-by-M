"use client";

import { create } from "zustand";

interface UiState {
  product: { productId: string; editLineId?: string } | null;
  cartOpen: boolean;
  openProduct: (productId: string, editLineId?: string) => void;
  closeProduct: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  product: null,
  cartOpen: false,
  openProduct: (productId, editLineId) => set({ product: { productId, editLineId }, cartOpen: false }),
  closeProduct: () => set({ product: null }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));
