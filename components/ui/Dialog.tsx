"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Libellé accessible (ou id d'un titre via labelledBy). */
  label?: string;
  labelledBy?: string;
  className?: string;
  /** Schéma de couleurs du panneau (le back-office est sombre). */
  scheme?: "light" | "dark";
  children: React.ReactNode;
}

/**
 * Dialogue accessible : portail, aria-modal, piège de focus, Échap, verrouillage du scroll.
 * Mobile : bottom sheet. Desktop : modale centrée.
 */
export function Dialog({ open, onClose, label, labelledBy, className, scheme = "light", children }: DialogProps) {
  const panelRef = useModal(open, onClose);
  const desktop = useMediaQuery("(min-width: 768px)");

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[80]", scheme === "dark" ? "scheme-dark" : "scheme-light", desktop && "flex items-center justify-center p-6")}>
          <motion.div className="absolute inset-0 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : label}
            aria-labelledby={labelledBy}
            initial={desktop ? { opacity: 0, y: 12, scale: 0.98 } : { y: "100%" }}
            animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={desktop ? { opacity: 0, y: 12, scale: 0.98 } : { y: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex flex-col overflow-hidden bg-raised text-fg shadow-sheet",
              desktop ? "relative max-h-[88dvh] w-full max-w-[640px] rounded-xl" : "absolute inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl",
              className,
            )}
          >
            <button type="button" onClick={onClose} aria-label="Fermer" className="absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full bg-raised/90 text-fg shadow-soft transition-colors hover:bg-fg/10">
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
