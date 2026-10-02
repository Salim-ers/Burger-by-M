"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
}

/** − 1 + en pilule (couleurs du schéma courant). */
export function QuantitySelector({ value, onChange, min = 1, max = 20, label = "Quantité", size = "md" }: Props) {
  const btn = cn("grid place-items-center rounded-full transition-colors hover:bg-fg/8 disabled:opacity-30 disabled:hover:bg-transparent", size === "md" ? "size-11" : "size-9");
  return (
    <div role="group" aria-label={label} className={cn("inline-flex shrink-0 items-center rounded-full border border-fg/15 text-fg", size === "md" ? "h-13 px-1" : "h-11 px-0.5")}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Retirer un">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className={cn("min-w-7 text-center font-semibold tabular-nums", size === "md" ? "text-base" : "text-sm")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Ajouter un">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
