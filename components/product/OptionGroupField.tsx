"use client";

import { Check } from "lucide-react";
import type { OptionGroup } from "@/types/product";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface Props {
  group: OptionGroup;
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
}

export function OptionGroupField({ group, value, onChange, invalid }: Props) {
  const single = group.kind === "single";
  const toggle = (id: string) => {
    if (single) return onChange([id]);
    if (value.includes(id)) return onChange(value.filter((v) => v !== id));
    if (group.max && value.length >= group.max) return;
    onChange([...value, id]);
  };
  return (
    <fieldset className="border-t border-fg/12 pt-5">
      {/* float-left : la légende se comporte comme un bloc normal (pas de coupure de bordure) */}
      <legend className="float-left flex w-full items-baseline justify-between gap-3">
        <span className="font-display text-xl leading-none">{group.label}</span>
        <span className={cn("kicker", invalid ? "text-danger" : "text-fg/45")}>{group.required ? "Obligatoire" : "Facultatif"}</span>
      </legend>
      {group.helper && <p className="clear-both pt-1.5 text-xs text-fg/50">{group.helper}</p>}
      <div className={cn("clear-both grid gap-1.5 pt-3", group.choices.length > 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {group.choices.map((c) => {
          const checked = value.includes(c.id);
          return (
            <label
              key={c.id}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-sm border px-3 py-2 text-sm transition-colors",
                checked ? "border-cheddar bg-cheddar text-ink" : "border-fg/15 text-fg/80 hover:border-fg/45",
              )}
            >
              <span className="flex items-center gap-3">
                <input type={single ? "radio" : "checkbox"} name={group.id} value={c.id} checked={checked} onChange={() => toggle(c.id)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-4.5 shrink-0 place-items-center border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cheddar",
                    single ? "rounded-full" : "rounded-xs",
                    checked ? "border-ink bg-ink text-cheddar" : "border-fg/35",
                  )}
                >
                  {checked && <Check className="size-3" strokeWidth={3.5} />}
                </span>
                <span className="leading-tight font-medium">{c.label}</span>
              </span>
              {c.priceDelta > 0 && <span className={cn("shrink-0 text-xs tabular-nums", checked ? "text-ink/70" : "text-fg/55")}>+{formatPrice(c.priceDelta)}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
