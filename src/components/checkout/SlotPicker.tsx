"use client";

import type { PickupSlot } from "@/lib/schedule";
import type { SlotsResponse } from "@/features/checkout/use-slots";
import { cn } from "@/lib/utils";

export type PickupChoice = { mode: "asap" } | { mode: "scheduled"; slotStart: string };

const hour = (label: string) => label.replace(":", "h");

/** Créneau de retrait : « dès que possible » ou heure précise (capacité restante calculée par le serveur). */
export function SlotPicker({ data, value, onChange, error }: { data: SlotsResponse; value: PickupChoice | null; onChange: (v: PickupChoice) => void; error?: string }) {
  const days = new Map<string, PickupSlot[]>();
  for (const s of data.slots) days.set(s.dayLabel, [...(days.get(s.dayLabel) ?? []), s]);
  const anyAvailable = data.slots.some((s) => s.available);

  if (!anyAvailable && !data.asap) {
    return (
      <div className="border border-ink px-5 py-5">
        <p className="t-s">Plus de créneau disponible en ligne pour le moment.</p>
        {data.nextOpening && <p className="mt-1 text-sm text-sub">Réouverture {data.nextOpening}.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8" role="radiogroup" aria-label="Heure de retrait" aria-invalid={Boolean(error) || undefined}>
      {data.asap && (
        <button
          type="button"
          role="radio"
          aria-checked={value?.mode === "asap"}
          onClick={() => onChange({ mode: "asap" })}
          className={cn("flex w-full items-center justify-between gap-4 border px-5 py-5 text-left transition-colors duration-300", value?.mode === "asap" ? "border-ink bg-ink text-cream" : "border-ink/25 hover:border-ink")}
        >
          <span>
            <span className="t-s block">Dès que possible</span>
            {data.prepMinutes !== null && <span className={cn("mt-1 block text-sm", value?.mode === "asap" ? "text-cream/70" : "text-sub")}>Préparation ≈ {data.prepMinutes} min</span>}
          </span>
          <span className={cn("t-m tabular-nums", value?.mode === "asap" && "text-cheddar")}>{hour(data.asap.label)}</span>
        </button>
      )}

      {[...days.entries()].map(([day, slots]) => (
        <div key={day}>
          <p className="t-label text-sub">{day}</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {slots.map((s) => {
              const selected = value?.mode === "scheduled" && value.slotStart === s.start;
              return (
                <button
                  key={s.start}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!s.available}
                  onClick={() => onChange({ mode: "scheduled", slotStart: s.start })}
                  aria-label={`${day} à ${hour(s.label)}${s.available ? "" : " — complet"}`}
                  className={cn(
                    "flex h-12 items-center justify-center border text-[0.92rem] font-bold tabular-nums transition-colors duration-300",
                    selected ? "border-ink bg-ink text-cheddar" : "border-ink/20 hover:border-ink",
                    !s.available && "cursor-not-allowed border-dashed text-sub line-through opacity-50 hover:border-ink/20",
                  )}
                >
                  {hour(s.label)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
