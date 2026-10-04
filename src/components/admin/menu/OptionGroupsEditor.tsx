"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { AdminGroup } from "@/features/admin/catalog";
import { saveModifierGroupAction, type ModifierGroupInput } from "@/features/admin/actions/menu";
import { adminButton, adminInput, Panel } from "../primitives";
import { Switch, useAction } from "../ui";
import { centsToInput, parsePriceInput } from "@/lib/money";
import { cn } from "@/lib/utils";

type DraftModifier = { id?: string; name: string; price: string; isDefault: boolean; isActive: boolean };
type Draft = { id?: string; name: string; helper: string; selectionType: "single" | "multiple"; minSelect: number; maxSelect: number | null; modifiers: DraftModifier[] };

const toDraft = (g: AdminGroup): Draft => ({
  id: g.id,
  name: g.name,
  helper: g.helper ?? "",
  selectionType: g.selectionType,
  minSelect: g.minSelect,
  maxSelect: g.maxSelect,
  modifiers: g.modifiers.map((m) => ({ id: m.id, name: m.name, price: centsToInput(m.priceDeltaCents), isDefault: m.isDefault, isActive: m.isActive })),
});

const NEW_GROUP: Draft = { name: "", helper: "", selectionType: "multiple", minSelect: 0, maxSelect: null, modifiers: [{ name: "", price: "0", isDefault: false, isActive: true }] };

/** Groupes d'options : suppléments, formules, boissons, toppings — prix et options pilotés par la base. */
export function OptionGroupsEditor({ groups }: { groups: AdminGroup[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <GroupForm key={g.id} initial={toDraft(g)} usage={g.usage} />
      ))}
      {creating ? (
        <GroupForm initial={NEW_GROUP} usage={0} onDone={() => setCreating(false)} />
      ) : (
        <button type="button" onClick={() => setCreating(true)} className={adminButton("primary")}>
          + Nouveau groupe d’options
        </button>
      )}
    </div>
  );
}

function GroupForm({ initial, usage, onDone }: { initial: Draft; usage: number; onDone?: () => void }) {
  const { exec, pending } = useAction();
  const [d, setD] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setMod = (i: number, patch: Partial<DraftModifier>) => set("modifiers", d.modifiers.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const moveMod = (i: number, dir: -1 | 1) => {
    const list = [...d.modifiers];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j]!, list[i]!];
    set("modifiers", list);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const modifiers: ModifierGroupInput["modifiers"] = [];
    for (const m of d.modifiers) {
      const cents = parsePriceInput(m.price || "0");
      if (cents === null) return setError(`Prix invalide pour « ${m.name || "option"} ».`);
      modifiers.push({ ...(m.id ? { id: m.id } : {}), name: m.name, priceDeltaCents: cents, isDefault: m.isDefault, isActive: m.isActive });
    }
    const r = await exec(
      () =>
        saveModifierGroupAction({
          ...(d.id ? { id: d.id } : {}),
          name: d.name,
          helper: d.helper || null,
          selectionType: d.selectionType,
          minSelect: d.minSelect,
          maxSelect: d.selectionType === "single" ? 1 : d.maxSelect,
          modifiers,
        }),
      { success: "Options enregistrées." },
    );
    if (r.ok) onDone?.();
  };

  return (
    <form onSubmit={save}>
      <Panel title={d.id ? d.name || "Groupe" : "Nouveau groupe"} actions={<span className="text-xs text-sub">{d.id ? `Utilisé par ${usage} produit${usage > 1 ? "s" : ""}` : ""}</span>}>
        <div className="grid gap-3 md:grid-cols-[1.4fr_2fr_1fr_0.7fr_0.7fr]">
          <label className="text-xs text-sub">
            Nom affiché
            <input required minLength={2} maxLength={60} value={d.name} onChange={(e) => set("name", e.target.value)} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Aide (facultatif)
            <input maxLength={160} value={d.helper} onChange={(e) => set("helper", e.target.value)} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Type
            <select value={d.selectionType} onChange={(e) => set("selectionType", e.target.value as Draft["selectionType"])} className={cn(adminInput, "mt-1")}>
              <option value="single">Choix unique</option>
              <option value="multiple">Choix multiple</option>
            </select>
          </label>
          <label className="text-xs text-sub">
            Minimum
            <input type="number" min={0} max={d.selectionType === "single" ? 1 : 10} value={d.minSelect} onChange={(e) => set("minSelect", Math.max(0, Number(e.target.value) || 0))} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Maximum
            <input
              type="number"
              min={1}
              max={20}
              disabled={d.selectionType === "single"}
              value={d.selectionType === "single" ? 1 : (d.maxSelect ?? "")}
              placeholder="∞"
              onChange={(e) => set("maxSelect", e.target.value ? Math.max(1, Number(e.target.value)) : null)}
              className={cn(adminInput, "mt-1")}
            />
          </label>
        </div>

        <ul className="mt-5 divide-y divide-rule border-y border-rule">
          {d.modifiers.map((m, i) => (
            <li key={m.id ?? `n${i}`} className={cn("flex flex-wrap items-center gap-2 py-2", !m.isActive && "opacity-50")}>
              <input value={m.name} onChange={(e) => setMod(i, { name: e.target.value })} required maxLength={60} placeholder="Option" aria-label={`Option ${i + 1}`} className={cn(adminInput, "h-10 min-w-40 flex-1")} />
              <label className="flex items-center gap-1 text-xs text-sub">
                +
                <input value={m.price} onChange={(e) => setMod(i, { price: e.target.value })} inputMode="decimal" aria-label={`Supplément ${m.name}`} className={cn(adminInput, "h-10 w-20 text-right tabular-nums")} />€
              </label>
              <label className="flex items-center gap-1.5 text-xs text-sub">
                <input type="checkbox" checked={m.isDefault} onChange={(e) => setMod(i, { isDefault: e.target.checked })} className="size-4 accent-[#c7a66a]" /> Par défaut
              </label>
              <label className="flex items-center gap-1.5 text-xs text-sub">
                <Switch checked={m.isActive} onChange={(v) => setMod(i, { isActive: v })} label={`${m.name} active`} /> Active
              </label>
              <button type="button" onClick={() => moveMod(i, -1)} disabled={i === 0} className="grid size-9 place-items-center text-sub hover:text-fg disabled:opacity-30" aria-label="Monter">
                <ArrowUp className="size-4" aria-hidden />
              </button>
              <button type="button" onClick={() => moveMod(i, 1)} disabled={i === d.modifiers.length - 1} className="grid size-9 place-items-center text-sub hover:text-fg disabled:opacity-30" aria-label="Descendre">
                <ArrowDown className="size-4" aria-hidden />
              </button>
              {!m.id && (
                <button type="button" onClick={() => set("modifiers", d.modifiers.filter((_, j) => j !== i))} className="grid size-9 place-items-center text-sub hover:text-[#f08a7e]" aria-label="Supprimer l’option">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-sub">Une option déjà utilisée ne se supprime pas : désactivez-la (elle reste lisible sur les anciennes commandes).</p>

        {error && <p className="mt-3 text-sm font-semibold text-[#f08a7e]">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => set("modifiers", [...d.modifiers, { name: "", price: "0", isDefault: false, isActive: true }])} className={adminButton("ghost", "sm")}>
            + Option
          </button>
          <button type="submit" disabled={pending} className={cn(adminButton("primary", "sm"), "ml-auto")}>
            Enregistrer
          </button>
          {onDone && (
            <button type="button" onClick={onDone} className={adminButton("ghost", "sm")}>
              Annuler
            </button>
          )}
        </div>
      </Panel>
    </form>
  );
}
