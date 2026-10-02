"use client";

import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { OrderBoard } from "@/components/admin/OrderBoard";
import { useAdminStore } from "@/stores/admin-store";

/** Écran cuisine : grosses cartes, horloge, plein écran pour tablette murale. */
export default function KitchenPage() {
  const [clock, setClock] = useState("");
  const rush = useAdminStore((s) => s.settings.rushMode);
  useEffect(() => {
    const tick = () => setClock(new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">
          Cuisine <span className="text-cream/40 tabular-nums">{clock}</span>
        </h1>
        <div className="flex items-center gap-3">
          {rush && <span className="rounded-sm bg-cream px-4 py-2 text-xs font-bold text-ink uppercase">Coup de feu</span>}
          <button
            type="button"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}
            className="flex h-11 items-center gap-2 rounded-sm border border-edge px-4 text-xs font-bold uppercase hover:border-edge/600"
          >
            <Maximize2 className="size-4" aria-hidden /> Plein écran
          </button>
        </div>
      </div>
      <OrderBoard large />
    </>
  );
}
