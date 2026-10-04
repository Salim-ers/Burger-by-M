"use client";

import { useState } from "react";
import { saveSettingsAction, type SettingsInput } from "@/features/admin/actions/settings";
import { adminButton, adminInput, Panel } from "./primitives";
import { Switch, useAction } from "./ui";
import { centsToInput, parsePriceInput } from "@/lib/money";
import { cn } from "@/lib/utils";

type Values = Omit<SettingsInput, "email" | "googleReviewsUrl" | "instagramUrl" | "facebookUrl"> & { email: string; googleReviewsUrl: string; instagramUrl: string; facebookUrl: string };

/** Réglages du restaurant (gérant) : coordonnées, commande en ligne, créneaux, paiement, liens. */
export function SettingsForm({ initial, stripeReady }: { initial: SettingsInput; stripeReady: boolean }) {
  const { exec, pending } = useAction();
  const [v, setV] = useState<Values>({
    ...initial,
    email: initial.email ?? "",
    googleReviewsUrl: initial.googleReviewsUrl ?? "",
    instagramUrl: initial.instagramUrl ?? "",
    facebookUrl: initial.facebookUrl ?? "",
  });
  const [minOrder, setMinOrder] = useState(centsToInput(initial.minOrderCents));
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Values>(k: K, value: Values[K]) => setV((x) => ({ ...x, [k]: value }));

  const num = (k: "prepMinutes" | "busyExtraMinutes" | "slotIntervalMinutes" | "maxOrdersPerSlot" | "scheduleDaysAhead", label: string, min: number, max: number, unit?: string) => (
    <label className="text-xs text-sub">
      {label}
      <span className="mt-1 flex items-center gap-2">
        <input type="number" min={min} max={max} required value={v[k]} onChange={(e) => set(k, Number(e.target.value))} className={cn(adminInput, "w-28 tabular-nums")} />
        {unit && <span className="text-sm text-sub">{unit}</span>}
      </span>
    </label>
  );

  const toggle = (k: "pickupEnabled" | "cardPaymentEnabled" | "onSitePaymentEnabled" | "orderNotesEnabled", label: string, help?: string, disabled?: boolean) => (
    <label className={cn("flex items-center justify-between gap-4 py-2", disabled && "opacity-50")}>
      <span className="text-sm">
        {label}
        {help && <span className="block text-xs text-sub">{help}</span>}
      </span>
      <Switch checked={v[k]} onChange={(x) => set(k, x)} label={label} disabled={disabled} />
    </label>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const min = parsePriceInput(minOrder || "0");
    if (min === null) return setError("Minimum de commande invalide.");
    void exec(
      () =>
        saveSettingsAction({
          ...v,
          minOrderCents: min,
          email: v.email || null,
          googleReviewsUrl: v.googleReviewsUrl || null,
          instagramUrl: v.instagramUrl || null,
          facebookUrl: v.facebookUrl || null,
        }),
      { success: "Réglages enregistrés." },
    );
  };

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-2">
      <Panel title="Coordonnées (affichées sur le site)">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-sub sm:col-span-2">
            Nom
            <input required value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={80} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub sm:col-span-2">
            Adresse
            <input required value={v.street} onChange={(e) => set("street", e.target.value)} maxLength={120} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Code postal
            <input required value={v.postalCode} onChange={(e) => set("postalCode", e.target.value)} pattern="\d{5}" className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Ville
            <input required value={v.city} onChange={(e) => set("city", e.target.value)} maxLength={80} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Téléphone
            <input required value={v.phone} onChange={(e) => set("phone", e.target.value)} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Email de contact (facultatif)
            <input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} maxLength={160} className={cn(adminInput, "mt-1")} />
          </label>
        </div>
      </Panel>

      <Panel title="Retrait et créneaux">
        <div className="grid gap-4 sm:grid-cols-2">
          {num("prepMinutes", "Temps de préparation", 5, 120, "min")}
          {num("busyExtraMinutes", "En plus en mode débordé", 0, 120, "min")}
          {num("slotIntervalMinutes", "Intervalle des créneaux", 5, 60, "min")}
          {num("maxOrdersPerSlot", "Commandes max. par créneau", 1, 100)}
          {num("scheduleDaysAhead", "Commande à l’avance", 0, 7, "jour(s)")}
          <label className="text-xs text-sub">
            Minimum de commande
            <span className="mt-1 flex items-center gap-2">
              <input inputMode="decimal" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={cn(adminInput, "w-28 tabular-nums")} />
              <span className="text-sm text-sub">€</span>
            </span>
          </label>
        </div>
        <div className="mt-4 divide-y divide-rule border-t border-rule">
          {toggle("pickupEnabled", "Retrait au restaurant", "Mode de commande principal.")}
          {toggle("orderNotesEnabled", "Précisions des clients", "Note sur la commande et sur les produits concernés.")}
          <label className="flex items-center justify-between gap-4 py-2 opacity-50">
            <span className="text-sm">
              Livraison
              <span className="block text-xs text-sub">Prévue dans la structure des commandes, pas encore proposée en ligne.</span>
            </span>
            <Switch checked={false} onChange={() => {}} label="Livraison" disabled />
          </label>
        </div>
      </Panel>

      <Panel title="Paiement">
        <div className="divide-y divide-rule">
          {toggle("cardPaymentEnabled", "Paiement en ligne (Stripe)", stripeReady ? "Carte bancaire, Apple Pay, Google Pay." : "Clés Stripe non configurées : indisponible.", !stripeReady)}
          {toggle("onSitePaymentEnabled", "Paiement au retrait", "Espèces ou carte au comptoir.")}
        </div>
        {!v.cardPaymentEnabled && !v.onSitePaymentEnabled && <p className="mt-3 text-sm text-[#f08a7e]">Aucun moyen de paiement actif : la commande en ligne sera indisponible.</p>}
      </Panel>

      <Panel title="Liens">
        <div className="grid gap-3">
          <label className="text-xs text-sub">
            Avis Google (lien de la fiche)
            <input type="url" value={v.googleReviewsUrl} onChange={(e) => set("googleReviewsUrl", e.target.value)} placeholder="https://g.page/…" className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Instagram
            <input type="url" value={v.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/…" className={cn(adminInput, "mt-1")} />
          </label>
          <label className="text-xs text-sub">
            Facebook
            <input type="url" value={v.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/…" className={cn(adminInput, "mt-1")} />
          </label>
        </div>
      </Panel>

      <div className="flex items-center gap-4 xl:col-span-2">
        <button type="submit" disabled={pending} className={adminButton("primary", "lg")}>
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
        {error && <p className="text-sm font-semibold text-[#f08a7e]">{error}</p>}
      </div>
    </form>
  );
}
