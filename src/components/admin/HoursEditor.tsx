"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { addSpecialDayAction, removeSpecialDayAction, saveWeeklyHoursAction } from "@/features/admin/actions/settings";
import { adminButton, adminInput, Panel } from "./primitives";
import { Switch, useAction } from "./ui";
import { DAY_NAMES, DAY_ORDER, formatRanges } from "@/lib/schedule";
import { cn } from "@/lib/utils";

type Range = { dayOfWeek: number; opensAt: string; closesAt: string };
type Special = { id: string; date: string; isClosed: boolean; opensAt: string | null; closesAt: string | null; note: string | null };

const dateLabel = (ymd: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ymd}T12:00:00Z`));

/** Semaine type + horaires exceptionnels (fermetures, jours fériés). Source unique : Neon. */
export function HoursEditor({ weekly, specials, today }: { weekly: Range[]; specials: Special[]; today: string }) {
  const { exec, pending } = useAction();
  const [ranges, setRanges] = useState<Range[]>(weekly);
  const [special, setSpecial] = useState({ date: today, isClosed: true, opensAt: "11:00", closesAt: "14:00", note: "" });
  const dirty = JSON.stringify(ranges) !== JSON.stringify(weekly);

  const update = (index: number, patch: Partial<Range>) => setRanges((list) => list.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Semaine type">
        <div className="space-y-4">
          {DAY_ORDER.map((day) => {
            const entries = ranges.map((r, i) => ({ r, i })).filter((x) => x.r.dayOfWeek === day);
            return (
              <div key={day} className="flex flex-wrap items-start gap-3 border-b border-rule pb-4 last:border-0">
                <p className="w-24 pt-2.5 font-semibold">{DAY_NAMES[day]}</p>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {entries.length === 0 && <p className="pt-2.5 text-sm text-sub">Fermé</p>}
                  {entries.map(({ r, i }) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={r.opensAt} onChange={(e) => update(i, { opensAt: e.target.value })} aria-label={`${DAY_NAMES[day]} ouverture`} className={cn(adminInput, "h-10 w-32")} />
                      <span className="text-sub">–</span>
                      <input type="time" value={r.closesAt} onChange={(e) => update(i, { closesAt: e.target.value })} aria-label={`${DAY_NAMES[day]} fermeture`} className={cn(adminInput, "h-10 w-32")} />
                      <button type="button" onClick={() => setRanges((list) => list.filter((_, j) => j !== i))} className="grid size-9 place-items-center text-sub hover:text-[#f08a7e]" aria-label="Supprimer la plage">
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setRanges((list) => [...list, { dayOfWeek: day, opensAt: entries.length ? "18:00" : "11:00", closesAt: entries.length ? "22:00" : "14:00" }])} className={adminButton("ghost", "sm")}>
                  + Plage
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-sub">{dirty ? "Modifications non enregistrées." : "Horaires affichés sur le site et utilisés pour les créneaux."}</p>
          <button
            type="button"
            disabled={pending || !dirty}
            onClick={() => exec(() => saveWeeklyHoursAction(ranges.map((r) => ({ ...r, opensAt: r.opensAt.slice(0, 5), closesAt: r.closesAt.slice(0, 5) }))), { success: "Horaires enregistrés." })}
            className={adminButton("primary")}
          >
            Enregistrer
          </button>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel title="Horaires exceptionnels">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void exec(
                () => addSpecialDayAction({ date: special.date, isClosed: special.isClosed, opensAt: special.isClosed ? null : special.opensAt, closesAt: special.isClosed ? null : special.closesAt, note: special.note || null }),
                { success: "Horaire exceptionnel ajouté." },
              ).then((r) => r.ok && setSpecial((s) => ({ ...s, note: "" })));
            }}
          >
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs text-sub">
                Date
                <input type="date" required min={today} value={special.date} onChange={(e) => setSpecial({ ...special, date: e.target.value })} className={cn(adminInput, "mt-1 w-44")} />
              </label>
              <label className="flex h-11 items-center gap-2 text-sm">
                <Switch checked={special.isClosed} onChange={(v) => setSpecial({ ...special, isClosed: v })} label="Fermé toute la journée" /> Fermé
              </label>
              {!special.isClosed && (
                <>
                  <label className="text-xs text-sub">
                    Ouverture
                    <input type="time" value={special.opensAt} onChange={(e) => setSpecial({ ...special, opensAt: e.target.value })} className={cn(adminInput, "mt-1 w-32")} />
                  </label>
                  <label className="text-xs text-sub">
                    Fermeture
                    <input type="time" value={special.closesAt} onChange={(e) => setSpecial({ ...special, closesAt: e.target.value })} className={cn(adminInput, "mt-1 w-32")} />
                  </label>
                </>
              )}
            </div>
            <label className="text-xs text-sub">
              Mention affichée (facultatif)
              <input value={special.note} maxLength={120} onChange={(e) => setSpecial({ ...special, note: e.target.value })} placeholder="Ex. : congés, jour férié" className={cn(adminInput, "mt-1")} />
            </label>
            <p className="text-xs text-sub">Pour une journée en deux services, ajoutez deux plages à la même date.</p>
            <button type="submit" disabled={pending} className={cn(adminButton("primary"), "justify-self-start")}>
              Ajouter
            </button>
          </form>
        </Panel>

        <Panel title="À venir">
          {specials.length === 0 ? (
            <p className="text-sm text-sub">Aucun horaire exceptionnel prévu.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {specials.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="flex-1 first-letter:uppercase">{dateLabel(s.date)}</span>
                  <span className={s.isClosed ? "text-[#f08a7e]" : "tabular-nums"}>{s.isClosed ? "Fermé" : formatRanges([{ opensAt: s.opensAt!, closesAt: s.closesAt! }])}</span>
                  {s.note && <span className="text-sub">{s.note}</span>}
                  <button type="button" disabled={pending} onClick={() => exec(() => removeSpecialDayAction(s.id), { success: "Supprimé." })} className="grid size-9 place-items-center text-sub hover:text-[#f08a7e]" aria-label="Supprimer">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
