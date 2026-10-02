"use client";

import { create } from "zustand";

interface UiState {
  /** Fiche produit ouverte (modale desktop / bottom sheet mobile). */
  product: { productId: string; editLineId?: string } | null;
  /** Confirmation discrète après un ajout au panier. */
  toast: { key: number; name: string; quantity: number } | null;
  openProduct: (productId: string, editLineId?: string) => void;
  closeProduct: () => void;
  showToast: (name: string, quantity: number) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  product: null,
  toast: null,
  openProduct: (productId, editLineId) => set({ product: { productId, editLineId } }),
  closeProduct: () => set({ product: null }),
  showToast: (name, quantity) => set({ toast: { key: Date.now(), name, quantity } }),
  hideToast: () => set({ toast: null }),
}));
