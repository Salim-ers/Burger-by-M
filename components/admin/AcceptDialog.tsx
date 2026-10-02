"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/types/order";
import { useAdminStore, effectivePrepMinutes } from "@/stores/admin-store";
import { cn } from "@/lib/utils";

const CHOICES = [15, 20, 25, 30, 40];

export function AcceptDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const settings = useAdminStore((s) => s.settings);
  const accept = useAdminStore((s) => s.acceptOrder);
  const [minutes, setMinutes] = useState<number | null>(null);
  const value = minutes ?? effectivePrepMinutes(settings);

  return (
    <Dialog scheme="dark" open={Boolean(order)} onClose={onClose} labelledBy="accept-title" className="md:max-w-md">
      <div className="p-6 pt-8 md:p-8">
        <h2 id="accept-title" className="text-2xl font-bold">
          Accepter #{order?.number.replace("BYM-", "")}
        </h2>
        <p className="mt-2 text-sm text-cream/60">Temps de préparation annoncé au client :</p>
        <div role="radiogroup" aria-label="Temps de préparation" className="mt-5 grid grid-cols-5 gap-2">
          {CHOICES.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={value === m}
              onClick={() => setMinutes(m)}
              className={cn("h-14 rounded-sm border text-lg font-bold tabular-nums", value === m ? "border-cream bg-cream text-ink" : "border-edge hover:border-edge/600")}
            >
              {m}
              <span className="block text-[0.6rem] font-semibold uppercase opacity-70">min</span>
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (order) accept(order.id, value);
              setMinutes(null);
              onClose();
            }}
          >
            Accepter
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
