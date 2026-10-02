"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { useMenuCategories, useMenuProducts } from "@/hooks/use-menu";
import { useAdminStore } from "@/stores/admin-store";

export default function CategoriesPage() {
  const categories = useMenuCategories();
  const products = useMenuProducts();
  const move = useAdminStore((s) => s.moveCategory);
  const setActive = useAdminStore((s) => s.setCategoryActive);

  return (
    <>
      <PageHeader title="Catégories" text="Ordre d’affichage sur la carte et visibilité. Une catégorie masquée disparaît du site." />
      <ol className="space-y-2">
        {categories.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-sm border border-edge bg-panel px-4 py-3">
            <span className="w-6 text-sm text-bone/40 tabular-nums">{i + 1}</span>
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-bone/50">{products.filter((p) => p.category === c.id).length} produits</p>
            </div>
            <Switch checked={c.active} onChange={(v) => setActive(c.id, v)} label={c.active ? "Visible" : "Masquée"} tone="success" className="text-xs" />
            <div className="flex gap-1">
              <button type="button" onClick={() => move(c.id, -1)} disabled={i === 0} aria-label={`Monter ${c.name}`} className="grid size-10 place-items-center rounded-sm hover:bg-bone/10 disabled:opacity-25">
                <ArrowUp className="size-4" aria-hidden />
              </button>
              <button type="button" onClick={() => move(c.id, 1)} disabled={i === categories.length - 1} aria-label={`Descendre ${c.name}`} className="grid size-10 place-items-center rounded-sm hover:bg-bone/10 disabled:opacity-25">
                <ArrowDown className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
