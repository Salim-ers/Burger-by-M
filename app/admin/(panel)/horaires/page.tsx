"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/admin-store";
import { DAY_NAMES, DAY_ORDER, OPENING_HOURS_VALIDATED, type WeekSchedule } from "@/data/opening-hours";
import { toMinutes } from "@/lib/hours";
import { cn } from "@/lib/utils";

type Kind = "restaurant" | "clickAndCollect";

export default function HoursPage() {
  const hours = useAdminStore((s) => s.hours);
  const setHours = useAdminStore((s) => s.setHours);
  const settings = useAdminStore((s) => s.settings);
  const setSetting = useAdminStore((s) => s.setSetting);
  const [kind, setKind] = useState<Kind>("restaurant");
  const [draft, setDraft] = useState<WeekSchedule>(() => structuredClone(hours.restaurant));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const switchKind = (k: Kind) => {
    setKind(k);
    setDraft(structuredClone(hours[k]));
    setError(null);
  };

  const update = (day: keyof WeekSchedule, fn: (r: WeekSchedule[keyof WeekSchedule]) => WeekSchedule[keyof WeekSchedule]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [day]: fn(d[day]) }));
  };

  const save = () => {
    for (const d of DAY_ORDER) {
      const ranges = [...draft[d]].sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
      for (let i = 0; i < ranges.length; i++) {
        const r = ranges[i]!;
        if (toMinutes(r.open) >= toMinutes(r.close)) return setError(`${DAY_NAMES[d]} : l’ouverture doit précéder la fermeture.`);
        const prev = ranges[i - 1];
        if (prev && toMinutes(prev.close) > toMinutes(r.open)) return setError(`${DAY_NAMES[d]} : deux plages se chevauchent.`);
      }
    }
    setError(null);
    setHours(kind, draft);
    setSaved(true);
  };

  const numberSetting = (key: "prepMinutes" | "rushPrepMinutes" | "slotIntervalMinutes" | "maxOrdersPerSlot", label: string, min: number, max: number) => (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-cream/80">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={settings[key]}
        onChange={(e) => {
          const n = Math.max(min, Math.min(max, Number(e.target.value) || min));
          setSetting(key, n);
        }}
        className="h-12 rounded-sm border border-cream/15 bg-transparent px-3 tabular-nums"
      />
    </label>
  );

  return (
    <>
      <PageHeader title="Horaires" text="Horaires d’ouverture et de prise de commande Click & Collect. Les créneaux proposés aux clients en découlent." />
      {!OPENING_HOURS_VALIDATED && (
        <p className="mb-6 rounded-sm border border-cheddar/40 bg-cheddar/10 p-4 text-sm text-cheddar">
          Horaires relevés sur la carte imprimée, à faire valider par le restaurant (data/opening-hours.ts).
        </p>
      )}

      <div role="tablist" aria-label="Type d’horaires" className="mb-6 inline-flex rounded-full border border-cream/15 p-1">
        {(
          [
            ["restaurant", "Restaurant"],
            ["clickAndCollect", "Click & Collect"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => switchKind(k)} className={cn("h-10 rounded-full px-4 text-xs font-bold uppercase", kind === k ? "bg-cream text-ink" : "text-cream/60")}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {DAY_ORDER.map((d) => (
          <div key={d} className="flex flex-wrap items-center gap-3 rounded-sm border border-cream/10 bg-ink-warm px-4 py-3">
            <span className="w-24 font-semibold">{DAY_NAMES[d]}</span>
            {draft[d].length === 0 && <Badge tone="muted">Fermé</Badge>}
            {draft[d].map((r, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <input
                  type="time"
                  aria-label={`${DAY_NAMES[d]} ouverture ${i + 1}`}
                  value={r.open}
                  onChange={(e) => update(d, (rs) => rs.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))}
                  className="h-10 rounded-sm border border-cream/15 bg-transparent px-2 tabular-nums [color-scheme:dark]"
                />
                <span className="text-cream/40">–</span>
                <input
                  type="time"
                  aria-label={`${DAY_NAMES[d]} fermeture ${i + 1}`}
                  value={r.close}
                  onChange={(e) => update(d, (rs) => rs.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))}
                  className="h-10 rounded-sm border border-cream/15 bg-transparent px-2 tabular-nums [color-scheme:dark]"
                />
                <button type="button" aria-label="Supprimer la plage" onClick={() => update(d, (rs) => rs.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-full text-cream/50 hover:bg-cream/10 hover:text-cream">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </span>
            ))}
            {draft[d].length < 3 && (
              <button type="button" onClick={() => update(d, (rs) => [...rs, { open: "18:00", close: "22:00" }])} className="ml-auto inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-cream/60 hover:bg-cream/10 hover:text-cream">
                <Plus className="size-3.5" aria-hidden /> Plage
              </button>
            )}
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-[#ff9b94]">
          {error}
        </p>
      )}
      <div className="mt-5 flex items-center gap-4">
        <Button variant="rose" onClick={save}>
          Enregistrer
        </Button>
        {saved && <span role="status" className="text-sm text-success">Horaires enregistrés.</span>}
      </div>

      <section aria-labelledby="cc-title" className="mt-12">
        <h2 id="cc-title" className="mb-4 text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">
          Réglages Click & Collect
        </h2>
        <div className="grid gap-4 rounded-sm border border-cream/10 bg-ink-warm p-5 sm:grid-cols-2 xl:grid-cols-4">
          {numberSetting("prepMinutes", "Préparation (min)", 5, 90)}
          {numberSetting("rushPrepMinutes", "Coup de feu (min)", 10, 120)}
          {numberSetting("slotIntervalMinutes", "Intervalle des créneaux (min)", 5, 60)}
          {numberSetting("maxOrdersPerSlot", "Commandes max / créneau", 1, 50)}
        </div>
      </section>
    </>
  );
}
