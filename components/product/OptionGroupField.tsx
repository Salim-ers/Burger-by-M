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

/** Groupe d'options en liste (cases à cocher / boutons radio), lisible au pouce. */
export function OptionGroupField({ group, value, onChange, invalid }: Props) {
  const single = group.kind === "single";
  const toggle = (id: string) => {
    if (single) return onChange([id]);
    if (value.includes(id)) return onChange(value.filter((v) => v !== id));
    if (group.max && value.length >= group.max) return;
    onChange([...value, id]);
  };
  return (
    <fieldset>
      <legend className="flex w-full items-baseline justify-between gap-3">
        <span className="text-base font-bold">{group.label}</span>
        <span className={cn("kicker text-[0.68rem]", invalid ? "text-danger" : "text-muted")}>{group.required ? "Obligatoire" : "Facultatif"}</span>
      </legend>
      {group.helper && <p className="mt-1 text-sm text-muted">{group.helper}</p>}
      <div className="mt-2 divide-y divide-line">
        {group.choices.map((c) => {
          const checked = value.includes(c.id);
          return (
            <label key={c.id} className="relative flex min-h-12 cursor-pointer items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-3">
                <input type={single ? "radio" : "checkbox"} name={group.id} value={c.id} checked={checked} onChange={() => toggle(c.id)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-[22px] shrink-0 place-items-center border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                    single ? "rounded-full" : "rounded-[5px]",
                    checked ? "border-ink bg-ink text-white" : "border-stone bg-white",
                  )}
                >
                  {checked && (single ? <span className="size-2 rounded-full bg-white" /> : <Check className="size-3.5" strokeWidth={3.5} />)}
                </span>
                <span className="text-[0.95rem] leading-tight">{c.label}</span>
              </span>
              {c.priceDelta > 0 && <span className="shrink-0 text-sm font-semibold text-muted tabular-nums">+{formatPrice(c.priceDelta)}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
