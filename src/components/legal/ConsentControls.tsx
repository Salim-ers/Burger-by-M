"use client";

import { setConsent, useConsent } from "@/features/consent";
import { Toggle } from "@/components/ui/Field";

export function ConsentControls() {
  const maps = useConsent("maps");
  return (
    <div className="mt-6 border border-rule bg-panel px-5 py-4 text-fg">
      <Toggle checked={maps} onChange={(v) => setConsent("maps", v)} label="Carte Google Maps" description={maps ? "Autorisée sur cet appareil." : "Non autorisée : la carte ne se charge pas."} />
    </div>
  );
}
