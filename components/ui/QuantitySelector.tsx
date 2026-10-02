"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

/** Sélecteur de quantité rectangulaire ; couleurs héritées du schéma (text-fg). */
export function QuantitySelector({ value, onChange, min = 1, max = 20, label = "Quantité", size = "md" }: Props) {
  const box = size === "lg" ? "size-14" : size === "md" ? "size-12" : "size-10";
  const btn = cn("grid place-items-center transition-colors hover:bg-fg hover:text-canvas disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-fg", box);
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 items-center rounded-sm border border-fg/25 text-fg">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Retirer un">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className={cn("min-w-9 text-center font-display tabular-nums", size === "lg" ? "text-2xl" : "text-xl")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Ajouter un">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
