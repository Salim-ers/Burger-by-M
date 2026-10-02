"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { useMenuCategories, useMenuProducts } from "@/hooks/use-menu";
import { useAdminStore } from "@/stores/admin-store";
import { cn } from "@/lib/utils";

/** Ruptures en un geste : le produit passe instantanément en « Indisponible » côté client. */
export default function AvailabilityPage() {
  const products = useMenuProducts();
  const categories = useMenuCategories();
  const setAvailability = useAdminStore((s) => s.setProductAvailability);
  const out = products.filter((p) => !p.available).length;

  return (
    <>
      <PageHeader title="Disponibilités" text={out ? `${out} produit${out > 1 ? "s" : ""} en rupture.` : "Tout est disponible."} />
      <div className="space-y-10">
        {categories.map((c) => {
          const list = products.filter((p) => p.category === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} aria-labelledby={`dispo-${c.id}`}>
              <h2 id={`dispo-${c.id}`} className="mb-3 text-xs font-bold tracking-[0.16em] text-cream/55 uppercase">
                {c.name}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <li key={p.id} className={cn("flex items-center justify-between gap-3 rounded-sm border px-4 py-2", p.available ? "border-cream/10 bg-ink-warm" : "border-danger/40 bg-danger/10")}>
                    <span className={cn("font-semibold", !p.available && "text-cream/60 line-through")}>{p.name}</span>
                    <Switch checked={p.available} onChange={(v) => setAvailability(p.id, v, p.name)} label={p.available ? "En stock" : "Rupture"} tone="success" className="text-xs" />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
