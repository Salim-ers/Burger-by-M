"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useUi } from "@/features/cart/store";

const useToastStore = create<{ msg: { id: number; text: string } | null; show: (t: string) => void; hide: () => void }>()((set) => ({
  msg: null,
  show: (text) => set({ msg: { id: Date.now(), text } }),
  hide: () => set({ msg: null }),
}));

export function useToast() {
  return useToastStore((s) => s.show);
}

/** Confirmation discrète d'ajout au panier, avec accès direct au panier. */
export function Toast() {
  const msg = useToastStore((s) => s.msg);
  const hide = useToastStore((s) => s.hide);
  const setCartOpen = useUi((s) => s.setCartOpen);
  useEffect(() => {
    if (!msg) return;
    const id = window.setTimeout(hide, 2800);
    return () => window.clearTimeout(id);
  }, [msg, hide]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-24 z-[70] flex justify-center md:inset-x-auto md:top-24 md:right-6 md:bottom-auto">
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg.id}
            role="status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xs bg-ink px-4 py-3.5 text-cream shadow-lift"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cheddar text-ink">
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="min-w-0 flex-1 text-sm">{msg.text}</p>
            <button
              type="button"
              onClick={() => {
                hide();
                setCartOpen(true);
              }}
              className="shrink-0 text-[0.68rem] font-bold tracking-[0.2em] text-cheddar uppercase underline underline-offset-4"
            >
              Panier
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
