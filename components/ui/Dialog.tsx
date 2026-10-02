"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type Placement = "center" | "side";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Libellé accessible (ou id d'un titre via labelledBy). */
  label?: string;
  labelledBy?: string;
  placement?: Placement;
  className?: string;
  children: React.ReactNode;
  closeTone?: "light" | "dark";
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

/**
 * Dialogue accessible : portail, aria-modal, piège de focus, Échap, verrouillage du scroll.
 * Mobile : bottom sheet. Desktop : centré (center) ou tiroir latéral (side).
 */
export function Dialog({ open, onClose, label, labelledBy, placement = "center", className, children, closeTone = "light" }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const desktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus({ preventScroll: true });
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const sheet = !desktop;
  const side = desktop && placement === "side";
  const initial = sheet ? { y: "100%" } : side ? { x: "100%" } : { opacity: 0, y: 24, scale: 0.98 };
  const animate = sheet ? { y: 0 } : side ? { x: 0 } : { opacity: 1, y: 0, scale: 1 };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[80]", !sheet && !side && "flex items-center justify-center p-6")}>
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : label}
            aria-labelledby={labelledBy}
            initial={initial}
            animate={animate}
            exit={initial}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute flex flex-col overflow-hidden bg-ink-warm text-cream shadow-panel",
              sheet && "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[18px]",
              side && "inset-y-0 right-0 w-full max-w-[460px]",
              !sheet && !side && "relative max-h-[88dvh] w-full max-w-[1080px] rounded-md",
              className,
            )}
          >
            {sheet && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-cream/25" />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className={cn(
                "absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full backdrop-blur-md transition-colors",
                closeTone === "light" ? "bg-ink/50 text-cream hover:bg-ink/80" : "bg-ivory/70 text-ink hover:bg-ivory",
              )}
            >
              <X className="size-5" aria-hidden />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
