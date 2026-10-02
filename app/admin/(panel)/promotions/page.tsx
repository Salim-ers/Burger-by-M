"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useAdminStore } from "@/stores/admin-store";
import { promotionSchema, fieldErrors } from "@/lib/validation";
import { formatPrice } from "@/lib/currency";

const empty = { code: "", name: "", type: "percent" as "percent" | "fixed", value: "", startsAt: "", endsAt: "", minimumOrder: "", active: true };

export default function PromotionsPage() {
  const promotions = useAdminStore((s) => s.promotions);
  const add = useAdminStore((s) => s.addPromotion);
  const toggle = useAdminStore((s) => s.togglePromotion);
  const remove = useAdminStore((s) => s.deletePromotion);
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = promotionSchema.safeParse({
      ...v,
      code: v.code.toUpperCase(),
      value: Number(v.value.replace(",", ".")),
      minimumOrder: Math.round(Number((v.minimumOrder || "0").replace(",", ".")) * 100),
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    if (parsed.data.endsAt < parsed.data.startsAt) return setErrors({ endsAt: "La fin doit suivre le début." });
    if (parsed.data.type === "percent" && parsed.data.value > 100) return setErrors({ value: "100 % maximum." });
    setErrors({});
    add({ ...parsed.data, value: parsed.data.type === "fixed" ? Math.round(parsed.data.value * 100) : parsed.data.value });
    setV(empty);
  };

  return (
    <>
      <PageHeader title="Promotions" text="Préparez vos codes promo. Leur application au panier sera activée avec le backend (architecture prête)." />
      <div className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={submit} noValidate className="grid gap-4 rounded-sm border border-edge bg-panel p-5 sm:grid-cols-2">
          <Field label="Code" id="pr-code" value={v.code} onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase() })} error={errors.code} placeholder="SMASH10" />
          <Field label="Nom interne" id="pr-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} />
          <div className="flex flex-col gap-2">
            <label htmlFor="pr-type" className="text-[0.78rem] font-semibold opacity-80">
              Type
            </label>
            <select id="pr-type" value={v.type} onChange={(e) => setV({ ...v, type: e.target.value as "percent" | "fixed" })} className="h-13 rounded-sm border border-edge bg-panel px-3">
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe (€)</option>
            </select>
          </div>
          <Field label={v.type === "percent" ? "Valeur (%)" : "Valeur (€)"} id="pr-value" inputMode="decimal" value={v.value} onChange={(e) => setV({ ...v, value: e.target.value })} error={errors.value} />
          <Field label="Début" id="pr-start" type="date" value={v.startsAt} onChange={(e) => setV({ ...v, startsAt: e.target.value })} error={errors.startsAt} className="[color-scheme:dark]" />
          <Field label="Fin" id="pr-end" type="date" value={v.endsAt} onChange={(e) => setV({ ...v, endsAt: e.target.value })} error={errors.endsAt} className="[color-scheme:dark]" />
          <Field label="Minimum de commande (€)" id="pr-min" inputMode="decimal" value={v.minimumOrder} onChange={(e) => setV({ ...v, minimumOrder: e.target.value })} error={errors.minimumOrder} />
          <div className="flex items-end">
            <Switch checked={v.active} onChange={(a) => setV({ ...v, active: a })} label="Active" tone="success" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary">
              Créer la promotion
            </Button>
          </div>
        </form>

        <div>
          {promotions.length === 0 ? (
            <p className="rounded-sm border border-dashed border-edge p-10 text-center text-cream/50">Aucune promotion pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {promotions.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-sm border border-edge bg-panel px-4 py-3">
                  <div className="flex-1">
                    <p className="text-xl font-bold">{p.code}</p>
                    <p className="text-xs text-cream/55">
                      {p.name} · {p.type === "percent" ? `${p.value} %` : formatPrice(p.value)} · du {p.startsAt} au {p.endsAt}
                      {p.minimumOrder > 0 && ` · dès ${formatPrice(p.minimumOrder)}`}
                    </p>
                  </div>
                  <Switch checked={p.active} onChange={() => toggle(p.id)} label="Active" srOnlyLabel tone="success" />
                  <button type="button" onClick={() => remove(p.id)} aria-label={`Supprimer ${p.code}`} className="grid size-10 place-items-center rounded-sm text-cream/50 hover:bg-cream/10 hover:text-cream">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
