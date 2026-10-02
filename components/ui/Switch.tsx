"use client";

import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  /** Masque visuellement le libellé (reste lu par les lecteurs d'écran). */
  srOnlyLabel?: boolean;
  tone?: "rose" | "success" | "danger" | "cheddar";
  disabled?: boolean;
  className?: string;
}

const onColors = { rose: "bg-rose", success: "bg-success", danger: "bg-danger", cheddar: "bg-cheddar" };

export function Switch({ checked, onChange, label, srOnlyLabel, tone = "rose", disabled, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("group inline-flex min-h-11 items-center gap-3 text-sm disabled:opacity-40", className)}
    >
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? onColors[tone] : "bg-current/20",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-ivory shadow transition-transform duration-300 ease-out-expo",
            checked && "translate-x-5 bg-ink",
          )}
        />
      </span>
      <span className={cn(srOnlyLabel && "sr-only")}>{label}</span>
    </button>
  );
}
