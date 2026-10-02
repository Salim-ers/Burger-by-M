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
    <fieldset className="border-t border-cream/10 pt-5">
      {/* float-left : la légende se comporte comme un bloc normal (pas de coupure de bordure) */}
      <legend className="float-left flex w-full items-baseline justify-between gap-3">
        <span className="text-[0.95rem] font-bold">{group.label}</span>
        <span className={cn("text-[0.7rem] font-semibold tracking-wide uppercase", invalid ? "text-[#ff9b94]" : "text-cream/50")}>
          {group.required ? "Obligatoire" : "Facultatif"}
        </span>
      </legend>
      {group.helper && <p className="clear-both pt-1 text-xs text-cream/55">{group.helper}</p>}
      <div className={cn("clear-both grid gap-2 pt-3", group.choices.length > 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {group.choices.map((c) => {
          const checked = value.includes(c.id);
          return (
            <label
              key={c.id}
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-sm border px-3.5 py-2 text-sm transition-colors",
                checked ? "border-rose bg-rose/10 text-cream" : "border-cream/15 text-cream/80 hover:border-cream/35",
              )}
            >
              <span className="flex items-center gap-3">
                <input
                  type={single ? "radio" : "checkbox"}
                  name={group.id}
                  value={c.id}
                  checked={checked}
                  onChange={() => toggle(c.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 shrink-0 place-items-center border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose",
                    single ? "rounded-full" : "rounded-xs",
                    checked ? "border-rose bg-rose text-ink" : "border-cream/35",
                  )}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="leading-tight">{c.label}</span>
              </span>
              {c.priceDelta > 0 && <span className="shrink-0 text-xs text-cream/60 tabular-nums">+{formatPrice(c.priceDelta)}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
