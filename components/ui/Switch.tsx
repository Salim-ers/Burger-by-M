"use client";

import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** Masque visuellement le libellé (reste lu par les lecteurs d'écran). */
  srOnlyLabel?: boolean;
  tone?: "accent" | "success" | "danger";
  disabled?: boolean;
  className?: string;
}

const onColors = { accent: "bg-fg", success: "bg-success", danger: "bg-danger" };

export function Switch({ checked, onChange, label, srOnlyLabel, tone = "accent", disabled, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex min-h-11 items-center gap-3 text-sm disabled:opacity-40", className)}
    >
      <span aria-hidden className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200", checked ? onColors[tone] : "bg-fg/20")}>
        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200", checked && "translate-x-5")} />
      </span>
      <span className={cn(srOnlyLabel && "sr-only")}>{label}</span>
    </button>
  );
}
