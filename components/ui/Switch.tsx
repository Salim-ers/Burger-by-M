"use client";

import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** Masque visuellement le libellé (reste lu par les lecteurs d'écran). */
  srOnlyLabel?: boolean;
  tone?: "cheddar" | "success" | "danger";
  disabled?: boolean;
  className?: string;
}

const onColors = { success: "bg-success", danger: "bg-danger", cheddar: "bg-cheddar" };

/** Interrupteur rectangulaire (outil pro, pas de pilule). */
export function Switch({ checked, onChange, label, srOnlyLabel, tone = "cheddar", disabled, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex min-h-11 items-center gap-3 text-sm disabled:opacity-40", className)}
    >
      <span aria-hidden className={cn("relative h-6 w-11 shrink-0 rounded-sm border transition-colors duration-200", checked ? cn(onColors[tone], "border-transparent") : "border-fg/25 bg-fg/5")}>
        <span className={cn("absolute top-0.5 left-0.5 size-[18px] rounded-xs transition-transform duration-200 ease-out-expo", checked ? "translate-x-5 bg-ink" : "bg-fg/60")} />
      </span>
      <span className={cn(srOnlyLabel && "sr-only")}>{label}</span>
    </button>
  );
}
