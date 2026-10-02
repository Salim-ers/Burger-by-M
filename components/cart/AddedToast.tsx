"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";

/** Confirmation discrète après un ajout au panier (2,6 s). */
export function AddedToast() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(hide, 2600);
    return () => window.clearTimeout(id);
  }, [toast, hide]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-24 z-[70] flex justify-center md:inset-x-auto md:top-24 md:right-6 md:bottom-auto">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-soft"
            role="status"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="min-w-0 flex-1 text-[0.92rem] leading-snug">
              <strong className="font-bold">{toast.quantity > 1 ? `${toast.quantity} × ${toast.name}` : toast.name}</strong> ajouté au panier
            </p>
            <Link href="/panier" onClick={hide} className="shrink-0 text-sm font-bold underline underline-offset-4">
              Voir
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
