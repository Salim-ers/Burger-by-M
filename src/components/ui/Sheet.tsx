"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** desktop : « side » = tiroir à droite, « center » = fenêtre centrée. Mobile : toujours bottom sheet. */
  desktop?: "side" | "center";
  className?: string;
  tone?: "light" | "dark";
  children: React.ReactNode;
}

/** Fenêtre accessible (aria-modal, focus piégé, Échap, défilement verrouillé). */
export function Sheet({ open, onClose, labelledBy, desktop = "center", className, tone = "light", children }: SheetProps) {
  const ref = useModal(open, onClose);
  const wide = useMediaQuery("(min-width: 768px)");
  if (typeof document === "undefined") return null;
  const side = wide && desktop === "side";
  const center = wide && desktop === "center";
  const from = side ? { x: "100%" } : center ? { opacity: 0, y: 20 } : { y: "100%" };
  const to = side ? { x: 0 } : center ? { opacity: 1, y: 0 } : { y: 0 };
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[80]", tone === "dark" ? "on-dark" : "on-light", center && "flex items-center justify-center p-6")}>
          <motion.div className="absolute inset-0 bg-ink/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={from}
            animate={to}
            exit={from}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className={cn(
              "flex flex-col overflow-hidden bg-bg text-fg shadow-sheet",
              side && "absolute inset-y-0 right-0 w-full max-w-[500px]",
              center && "relative max-h-[90dvh] w-full max-w-[1040px] rounded-[4px]",
              !wide && "absolute inset-x-0 top-[4dvh] bottom-0 rounded-t-[8px]",
              className,
            )}
          >
            <button type="button" onClick={onClose} className="t-label absolute top-3 right-3 z-20 h-11 px-4 text-fg transition-colors hover:text-cheddar-deep">
              Fermer ✕
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
