"use client";

import { setOperationalAction } from "@/features/admin/actions/settings";
import { Switch, useAction } from "./ui";
import { cn } from "@/lib/utils";

/** Le gros interrupteur « Commandes en ligne » + mode débordé (accessibles à toute l'équipe). */
export function OperationalControls({ onlineOrderingEnabled, busyMode, busyExtraMinutes }: { onlineOrderingEnabled: boolean; busyMode: boolean; busyExtraMinutes: number }) {
  const { exec, pending } = useAction();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className={cn("flex items-center justify-between gap-6 border p-6 transition-colors", onlineOrderingEnabled ? "border-[#3f9e6b]/60 bg-[#3f9e6b]/10" : "border-[#f08a7e]/50 bg-[#f08a7e]/[0.07]")}>
        <div>
          <p className="kicker text-sub">Commandes en ligne</p>
          <p className="mt-2 font-serif text-4xl leading-none">{onlineOrderingEnabled ? "Ouvertes" : "Coupées"}</p>
          <p className="mt-2 text-sm text-sub">{onlineOrderingEnabled ? "Les clients peuvent commander sur le site." : "Le site affiche : « Les commandes en ligne sont momentanément indisponibles. »"}</p>
        </div>
        <Switch
          size="lg"
          label="Commandes en ligne"
          checked={onlineOrderingEnabled}
          disabled={pending}
          onChange={(v) => exec(() => setOperationalAction({ onlineOrderingEnabled: v }), { success: v ? "Commandes en ligne ouvertes." : "Commandes en ligne coupées." })}
        />
      </div>
      <div className={cn("flex items-center justify-between gap-6 border p-6 transition-colors", busyMode ? "border-brass/60 bg-brass/10" : "border-rule bg-panel")}>
        <div>
          <p className="kicker text-sub">Mode débordé</p>
          <p className="mt-2 font-serif text-4xl leading-none">{busyMode ? "Activé" : "Normal"}</p>
          <p className="mt-2 text-sm text-sub">Ajoute {busyExtraMinutes} min au temps de préparation annoncé et aux créneaux.</p>
        </div>
        <Switch size="lg" label="Mode débordé" checked={busyMode} disabled={pending} onChange={(v) => exec(() => setOperationalAction({ busyMode: v }), { success: v ? "Mode débordé activé." : "Mode débordé désactivé." })} />
      </div>
    </div>
  );
}
