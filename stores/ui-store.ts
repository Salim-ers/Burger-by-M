"use client";

import { create } from "zustand";

/** Rectangle (viewport) de la vignette cliquée : la photo de la fiche produit s'étend depuis là. */
export interface OriginRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface UiState {
  product: { productId: string; editLineId?: string; origin?: OriginRect | null } | null;
  cartOpen: boolean;
  openProduct: (productId: string, editLineId?: string, origin?: OriginRect | null) => void;
  closeProduct: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  product: null,
  cartOpen: false,
  openProduct: (productId, editLineId, origin) => set({ product: { productId, editLineId, origin: origin ?? null }, cartOpen: false }),
  closeProduct: () => set({ product: null }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));

/** Rectangle d'un élément, à passer comme origine d'ouverture. */
export function rectOf(el: Element | null | undefined): OriginRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}
