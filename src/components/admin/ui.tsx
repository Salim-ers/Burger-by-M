"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------- Notifications ---------------- */

type Notice = { id: number; text: string; tone: "ok" | "error" };
const useNotices = create<{ items: Notice[]; push: (text: string, tone?: Notice["tone"]) => void; drop: (id: number) => void }>()((set) => ({
  items: [],
  push: (text, tone = "ok") => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items.slice(-2), { id, text, tone }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((n) => n.id !== id) })), tone === "error" ? 6000 : 2800);
  },
  drop: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
}));

export function useNotify() {
  return useNotices((s) => s.push);
}

export function AdminNotices() {
  const items = useNotices((s) => s.items);
  const drop = useNotices((s) => s.drop);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[120] flex w-[min(92vw,380px)] flex-col gap-2">
      <AnimatePresence>
        {items.map((n) => (
          <motion.button
            type="button"
            key={n.id}
            onClick={() => drop(n.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn("pointer-events-auto border px-4 py-3 text-left text-sm font-semibold shadow-lift", n.tone === "ok" ? "border-[#5fb98a]/50 bg-ink-soft text-fg" : "border-[#f08a7e]/60 bg-ink-soft text-[#f08a7e]")}
          >
            {n.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Server Actions ---------------- */

type Result<T> = { ok: true; data?: T } | { ok: false; error: string };

/** Exécute une Server Action : état « en cours », message de succès / d'erreur, rafraîchissement des données. */
export function useAction() {
  const router = useRouter();
  const notify = useNotify();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const exec = useCallback(
    async <T,>(fn: () => Promise<Result<T>>, opts: { success?: string; refresh?: boolean } = {}): Promise<Result<T>> => {
      setBusy(true);
      try {
        const r = await fn();
        if (r.ok) {
          if (opts.success) notify(opts.success);
          if (opts.refresh !== false) startTransition(() => router.refresh());
        } else notify(r.error, "error");
        return r;
      } catch {
        notify("Connexion perdue : action non enregistrée.", "error");
        return { ok: false, error: "network" };
      } finally {
        setBusy(false);
      }
    },
    [notify, router],
  );
  return { exec, pending: pending || busy };
}

/** Grand interrupteur tactile. */
export function Switch({ checked, onChange, disabled, label, size = "md" }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50", lg ? "h-10 w-[4.5rem]" : "h-7 w-12", checked ? "bg-[#3f9e6b]" : "bg-fg/20")}
    >
      <span className={cn("absolute top-1 left-1 rounded-full bg-white shadow transition-transform duration-200", lg ? "size-8" : "size-5", checked && (lg ? "translate-x-8" : "translate-x-5"))} />
    </button>
  );
}
