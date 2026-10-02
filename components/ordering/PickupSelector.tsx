"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, CalendarClock } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useAdminStore } from "@/stores/admin-store";
import { useOrdering } from "@/hooks/use-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { generatePickupSlots, isOpenForAsap, slotKey } from "@/lib/hours";
import { orderingDefaults } from "@/data/restaurant";
import { cn } from "@/lib/utils";

/** Choix du retrait : « dès que possible » ou créneau (horaires C&C + préparation + capacité). */
export function PickupSelector({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const pickup = useCartStore((s) => s.pickup);
  const setPickup = useCartStore((s) => s.setPickup);
  const orders = useAdminStore((s) => s.orders);
  const { prepMinutes, interval, maxPerSlot, hours } = useOrdering();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const load = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      if (o.status === "CANCELLED" || o.status === "COMPLETED") continue;
      const k = slotKey(o.pickup.time);
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  const slots = useMemo(
    () =>
      generatePickupSlots({
        schedule: hours.clickAndCollect,
        prepMinutes,
        intervalMinutes: interval,
        maxPerSlot,
        load,
        count: orderingDefaults.slotsShown,
        now,
      }),
    [hours.clickAndCollect, prepMinutes, interval, maxPerSlot, load, now],
  );
  const asapOk = isOpenForAsap(hours.clickAndCollect, prepMinutes, now);

  // Corrige un choix devenu impossible (créneau passé, restaurant fermé…).
  useEffect(() => {
    if (!hydrated) return;
    if (pickup.mode === "asap" && !asapOk && slots[0]) setPickup({ mode: "scheduled", time: slots.find((s) => s.available)?.time ?? slots[0].time });
    if (pickup.mode === "scheduled" && !slots.some((s) => s.time === pickup.time && s.available)) {
      if (asapOk) setPickup({ mode: "asap" });
      else {
        const first = slots.find((s) => s.available);
        if (first) setPickup({ mode: "scheduled", time: first.time });
      }
    }
  }, [hydrated, asapOk, slots, pickup, setPickup]);

  if (!hydrated) return <div className={cn("h-40 animate-pulse rounded-xl bg-ink/5", className)} aria-hidden />;

  const days = Array.from(new Set(slots.map((s) => s.dayLabel)));

  return (
    <div className={className}>
      <div role="radiogroup" aria-label="Heure de retrait" className="grid gap-2 sm:grid-cols-2">
        <ModeOption
          active={pickup.mode === "asap"}
          disabled={!asapOk}
          onSelect={() => setPickup({ mode: "asap" })}
          icon={<Clock className="size-5" aria-hidden />}
          title="Dès que possible"
          text={asapOk ? `Prête dans ${Math.max(5, prepMinutes - orderingDefaults.prepSpreadMinutes)}–${prepMinutes + orderingDefaults.prepSpreadMinutes} min` : "Indisponible pour le moment"}
        />
        <ModeOption
          active={pickup.mode === "scheduled"}
          disabled={slots.length === 0}
          onSelect={() => {
            const first = slots.find((s) => s.available);
            if (first) setPickup({ mode: "scheduled", time: first.time });
          }}
          icon={<CalendarClock className="size-5" aria-hidden />}
          title="Choisir une heure"
          text={slots.length ? "Selon les créneaux disponibles" : "Aucun créneau disponible"}
        />
      </div>

      {pickup.mode === "scheduled" && (
        <div className="mt-5 space-y-4">
          {days.map((day) => (
            <div key={day}>
              <p className="mb-2 text-sm font-semibold text-muted first-letter:uppercase">{day}</p>
              <div role="radiogroup" aria-label={`Créneaux ${day}`} className="flex flex-wrap gap-2">
                {slots
                  .filter((s) => s.dayLabel === day)
                  .map((s) => {
                    const selected = pickup.time === s.time;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={!s.available}
                        onClick={() => setPickup({ mode: "scheduled", time: s.time })}
                        className={cn(
                          "h-11 min-w-[4.75rem] shrink-0 rounded-full border px-4 text-[0.95rem] font-semibold tabular-nums transition-colors",
                          selected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/50",
                          !s.available && "line-through opacity-35",
                        )}
                      >
                        {s.label}
                        {!s.available && <span className="sr-only"> (complet)</span>}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeOption({ active, disabled, onSelect, icon, title, text }: { active: boolean; disabled?: boolean; onSelect: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        active ? "border-ink" : "border-line hover:border-ink/40",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", active ? "bg-ink text-white" : "bg-cream text-ink")}>{icon}</span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{text}</span>
      </span>
    </button>
  );
}
