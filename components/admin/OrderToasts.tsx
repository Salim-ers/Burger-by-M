"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";
import { formatPrice } from "@/lib/currency";
import { formatTime } from "@/lib/hours";
import { playOrderChime } from "@/lib/admin";

interface Toast {
  id: string;
  orderId: string;
  number: string;
  total: number;
  pickup: string;
}

/**
 * Détecte les nouvelles commandes (même depuis un autre onglet) et affiche une alerte.
 * Production : remplacer par un abonnement temps réel (Supabase Realtime, SSE, WebSocket).
 */
export function OrderToasts() {
  const router = useRouter();
  const orders = useAdminStore((s) => s.orders);
  const sound = useAdminStore((s) => s.settings.soundEnabled);
  const known = useRef<Set<string> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const pending = orders.filter((o) => o.status === "PENDING");
    if (known.current === null) {
      known.current = new Set(orders.map((o) => o.id));
      return;
    }
    const fresh = pending.filter((o) => !known.current!.has(o.id));
    orders.forEach((o) => known.current!.add(o.id));
    if (fresh.length === 0) return;
    if (sound) playOrderChime();
    setToasts((t) => [...fresh.map((o) => ({ id: `t-${o.id}`, orderId: o.id, number: o.number.replace("BYM-", ""), total: o.total, pickup: formatTime(o.pickup.time) })), ...t].slice(0, 4));
  }, [orders, sound]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const id = window.setTimeout(() => setToasts((t) => t.slice(0, -1)), 9000);
    return () => window.clearTimeout(id);
  }, [toasts]);

  return (
    <div aria-live="assertive" className="pointer-events-none fixed right-4 bottom-4 z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="pointer-events-auto flex items-start gap-3 rounded-sm bg-cheddar p-4 text-ink shadow-float"
            role="alert"
          >
            <BellRing className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="flex-1">
              <p className="font-bold">Nouvelle commande #{t.number}</p>
              <p className="text-sm">
                {formatPrice(t.total)} · Retrait {t.pickup}
              </p>
              <button
                type="button"
                onClick={() => {
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                  router.push(`/admin/commandes/${t.orderId}`);
                }}
                className="mt-2 text-xs font-bold tracking-wider uppercase underline underline-offset-4"
              >
                Voir
              </button>
            </div>
            <button type="button" aria-label="Fermer l’alerte" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="grid size-8 place-items-center rounded-sm hover:bg-ink/10">
              <X className="size-4" aria-hidden />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
