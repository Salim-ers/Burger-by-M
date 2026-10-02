"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md";
}

export function QuantitySelector({ value, onChange, min = 1, max = 20, label = "Quantité", tone = "dark", size = "md" }: Props) {
  const btn = cn(
    "grid place-items-center rounded-full transition-colors disabled:opacity-30",
    size === "md" ? "size-11" : "size-10",
    tone === "dark" ? "hover:bg-cream/10" : "hover:bg-ink/10",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full border",
        tone === "dark" ? "border-cream/20 text-cream" : "border-ink/20 text-ink",
      )}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Retirer un">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Ajouter un">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
