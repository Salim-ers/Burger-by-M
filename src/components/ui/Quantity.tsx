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

export function Quantity({ value, onChange, min = 1, max = 20, label = "Quantité", size = "md" }: Props) {
  const btn = cn("grid place-items-center transition-colors hover:bg-fg/8 disabled:opacity-25 disabled:hover:bg-transparent", size === "md" ? "size-12" : "size-10");
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 items-center rounded-xs border border-rule text-fg">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Retirer un">
        <Minus className="size-4" aria-hidden strokeWidth={1.75} />
      </button>
      <span className={cn("min-w-8 text-center font-semibold tabular-nums", size === "md" ? "text-base" : "text-sm")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Ajouter un">
        <Plus className="size-4" aria-hidden strokeWidth={1.75} />
      </button>
    </div>
  );
}
