"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { useAdminStore } from "@/stores/admin-store";
import { useCheckoutStore } from "@/stores/checkout-store";

const stores = {
  "bym-cart": useCartStore,
  "bym-admin": useAdminStore,
  "bym-checkout": useCheckoutStore,
} as const;

/**
 * Réhydrate les stores persistés après le premier rendu (pas d'écart SSR/client)
 * et synchronise les onglets : une commande passée sur le site apparaît
 * instantanément dans le back-office ouvert dans un autre onglet (démo temps réel).
 */
export function StoreHydrator() {
  useEffect(() => {
    Object.values(stores).forEach((s) => void s.persist.rehydrate());
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key in stores) void stores[e.key as keyof typeof stores].persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

/** Respecte prefers-reduced-motion pour toutes les animations Framer Motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <StoreHydrator />
      {children}
    </MotionConfig>
  );
}
