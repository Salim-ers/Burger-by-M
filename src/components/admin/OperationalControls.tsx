"use client";

import Link from "next/link";
import { useState } from "react";
import { setOperationalAction } from "@/features/admin/actions/settings";
import { adminButton, adminInput } from "./primitives";
import { Switch, useAction } from "./ui";
import { cn } from "@/lib/utils";

/**
 * Pilotage du service (toute l'équipe) : COMMANDES ONLINE ON/OFF et MODE COUP DE FEU.
 * Sans temps de préparation configuré, la commande en ligne ne peut pas être ouverte.
 */
export function OperationalControls({ onlineOrderingEnabled, busyMode, prepMinutes, rushPrepMinutes, canConfigure }: { onlineOrderingEnabled: boolean; busyMode: boolean; prepMinutes: number | null; rushPrepMinutes: number | null; canConfigure: boolean }) {
  const { exec, pending } = useAction();
  const [rush, setRush] = useState(rushPrepMinutes === null ? "" : String(rushPrepMinutes));
  const ready = prepMinutes !== null;
  const online = onlineOrderingEnabled && ready;
  const rushValue = rush.trim() === "" ? null : Number(rush);
  const rushDirty = rushValue !== rushPrepMinutes;

  const saveRush = (e: React.FormEvent) => {
    e.preventDefault();
    if (rushValue === null || !Number.isInteger(rushValue)) return;
    void exec(() => setOperationalAction({ rushPrepMinutes: rushValue }), { success: `Coup de feu : ${rushValue} min.` });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <section aria-label="Commandes online" className={cn("flex flex-col gap-5 border p-6 transition-colors", online ? "border-open/60 bg-open/10" : "border-closed/50 bg-closed/[0.07]")}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="t-label text-sub">Commandes online</p>
            <p className="mt-2 font-display text-[3.5rem] leading-none">{online ? "ON" : "OFF"}</p>
            <p className="mt-3 text-sm leading-relaxed text-sub">{online ? "Les clients commandent et paient sur le site." : "Le site affiche « Commandes temporairement fermées ». Le téléphone reste indiqué."}</p>
          </div>
          <Switch
            size="lg"
            label="Commandes online"
            checked={online}
            disabled={pending || (!ready && !onlineOrderingEnabled)}
            onChange={(v) => exec(() => setOperationalAction({ onlineOrderingEnabled: v }), { success: v ? "Commandes online ouvertes." : "Commandes online fermées." })}
          />
        </div>
        {!ready && (
          <p className="border-l-2 border-cheddar pl-3 text-sm leading-relaxed">
            Temps de préparation non configuré : aucune heure de retrait ne peut être annoncée, les commandes restent fermées.{" "}
            {canConfigure ? (
              <Link href="/admin/settings#preparation" className="font-semibold text-cheddar underline underline-offset-4">
                Le régler
              </Link>
            ) : (
              "Demandez au gérant de le régler."
            )}
          </p>
        )}
      </section>

      <section aria-label="Mode coup de feu" className={cn("flex flex-col gap-5 border p-6 transition-colors", busyMode ? "border-cheddar/70 bg-cheddar/10" : "border-rule bg-panel")}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="t-label text-sub">Mode coup de feu</p>
            <p className="mt-2 flex items-baseline gap-3 font-display text-[3.5rem] leading-none tabular-nums" aria-label={`${prepMinutes ?? "non réglé"} minutes, ${rushPrepMinutes ?? "non réglé"} en coup de feu`}>
              <span className={cn(prepMinutes === null && "text-sub")}>{prepMinutes ?? "?"}</span>
              <span className="font-sans text-[1.6rem] text-cheddar" aria-hidden>
                →
              </span>
              <span className={cn(rushPrepMinutes === null && "text-sub")}>{rushPrepMinutes ?? "?"}</span>
              <span className="text-[1.3rem]">min</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-sub">{busyMode ? `Actif : créneaux et estimations calculés sur ${Math.max(rushPrepMinutes ?? 0, prepMinutes ?? 0)} min.` : "Allonge le temps de préparation annoncé quand la cuisine est sous pression."}</p>
          </div>
          <Switch
            size="lg"
            label="Mode coup de feu"
            checked={busyMode}
            disabled={pending || (!busyMode && rushPrepMinutes === null)}
            onChange={(v) => exec(() => setOperationalAction({ busyMode: v }), { success: v ? "Coup de feu activé." : "Coup de feu désactivé." })}
          />
        </div>
        <form onSubmit={saveRush} className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-sub">
            Temps en coup de feu
            <span className="mt-1 flex items-center gap-2">
              <input type="number" inputMode="numeric" min={(prepMinutes ?? 4) + 1} max={180} value={rush} onChange={(e) => setRush(e.target.value)} placeholder="ex. 35" className={cn(adminInput, "w-24 tabular-nums")} aria-label="Temps de préparation en coup de feu (minutes)" />
              <span className="text-sm">min</span>
            </span>
          </label>
          <button type="submit" disabled={pending || !rushDirty || rushValue === null} className={adminButton("ghost")}>
            Enregistrer
          </button>
        </form>
      </section>
    </div>
  );
}
