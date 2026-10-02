"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useModal } from "@/hooks/use-modal";
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
}

/**
 * Dialogue accessible : portail, aria-modal, piège de focus, Échap, verrouillage du scroll.
 * Mobile : feuille plein écran depuis le bas. Desktop : centré (center) ou tiroir latéral (side).
 */
export function Dialog({ open, onClose, label, labelledBy, placement = "center", className, children }: DialogProps) {
  const panelRef = useModal(open, onClose);
  const desktop = useMediaQuery("(min-width: 768px)");

  const sheet = !desktop;
  const side = desktop && placement === "side";
  const initial = sheet ? { y: "100%" } : side ? { x: "100%" } : { opacity: 0, y: 16 };
  const animate = sheet ? { y: 0 } : side ? { x: 0 } : { opacity: 1, y: 0 };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("scheme-dark fixed inset-0 z-[80]", !sheet && !side && "flex items-center justify-center p-6")}>
          <motion.div
            className="absolute inset-0 bg-ink/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute flex flex-col overflow-hidden border-graphite bg-coal text-bone",
              sheet && "inset-x-0 bottom-0 max-h-[94dvh] border-t",
              side && "inset-y-0 right-0 w-full max-w-[480px] border-l",
              !sheet && !side && "relative max-h-[88dvh] w-full max-w-[1080px] border",
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-sm text-bone transition-colors hover:bg-bone hover:text-ink"
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
