"use client";

import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/admin-store";
import { fullAddress, restaurant } from "@/data/restaurant";
import { playOrderChime } from "@/lib/admin";

export default function SettingsPage() {
  const settings = useAdminStore((s) => s.settings);
  const setSetting = useAdminStore((s) => s.setSetting);
  const resetDemo = useAdminStore((s) => s.resetDemo);
  const [done, setDone] = useState(false);

  return (
    <>
      <PageHeader title="Paramètres" />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-2 rounded-sm border border-edge bg-panel p-5">
          <h2 className="mb-2 text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Service</h2>
          <Switch checked={settings.acceptingOrders} onChange={(v) => setSetting("acceptingOrders", v)} label="Accepter les commandes en ligne" tone="success" />
          <Switch checked={settings.rushMode} onChange={(v) => setSetting("rushMode", v)} label={`Mode coup de feu (${settings.prepMinutes} → ${settings.rushPrepMinutes} min)`} tone="accent" />
          <div className="flex flex-wrap items-center gap-3">
            <Switch checked={settings.soundEnabled} onChange={(v) => setSetting("soundEnabled", v)} label="Son des nouvelles commandes" />
            <button type="button" onClick={playOrderChime} className="text-xs text-cream/60 underline underline-offset-4 hover:text-cream">
              Tester le son
            </button>
          </div>
        </section>

        <section className="rounded-sm border border-edge bg-panel p-5">
          <h2 className="mb-4 text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">Établissement</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cream/55">Nom</dt>
              <dd>{restaurant.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream/55">Adresse</dt>
              <dd className="text-right">{fullAddress}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cream/55">Téléphone</dt>
              <dd>{restaurant.phone.display}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-cream/45">Modifiable dans data/restaurant.ts (source unique), puis depuis l’admin une fois le backend branché.</p>
        </section>

        <section className="rounded-sm border border-danger/30 bg-danger/5 p-5 xl:col-span-2">
          <h2 className="text-xs font-bold tracking-[0.16em] text-danger uppercase">Démonstration</h2>
          <p className="mt-2 max-w-xl text-sm text-cream/65">
            Réinitialise les commandes fictives, produits, horaires, promotions et notifications stockés dans ce navigateur.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Réinitialiser toutes les données de démonstration ?")) {
                  resetDemo();
                  setDone(true);
                }
              }}
            >
              Réinitialiser la démo
            </Button>
            {done && <span role="status" className="text-sm text-success">Données réinitialisées.</span>}
          </div>
        </section>
      </div>
    </>
  );
}
