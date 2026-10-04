"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import type { MenuCategory, MenuProduct } from "@/features/menu/types";
import type { PublicStore } from "@/features/public-data";
import { useCart } from "@/features/cart/store";

interface SiteData {
  menu: MenuCategory[];
  products: Map<string, MenuProduct>;
  store: PublicStore;
}

const Ctx = createContext<SiteData | null>(null);

/** Carte et informations du restaurant (servies par le serveur, mises en cache) pour tous les composants client. */
export function SiteProvider({ menu, store, children }: { menu: MenuCategory[]; store: PublicStore; children: React.ReactNode }) {
  const value = useMemo(() => ({ menu, store, products: new Map(menu.flatMap((c) => c.products.map((p) => [p.id, p] as const))) }), [menu, store]);
  useEffect(() => {
    void useCart.persist.rehydrate();
    // Synchronise le panier entre onglets.
    const onStorage = (e: StorageEvent) => e.key === "bym-cart-v2" && void useCart.persist.rehydrate();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
    </MotionConfig>
  );
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite hors de SiteProvider");
  return v;
}
