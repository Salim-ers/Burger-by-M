"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Pencil, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Price } from "@/components/ui/Price";
import { useMenuProducts } from "@/hooks/use-menu";
import { useAdminStore } from "@/stores/admin-store";
import { categories } from "@/data/categories";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const products = useMenuProducts();
  const setAvailability = useAdminStore((s) => s.setProductAvailability);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const list = useMemo(
    () => products.filter((p) => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())),
    [products, q, cat],
  );

  return (
    <>
      <PageHeader
        title="Produits"
        text={`${products.length} produits. Les modifications sont visibles immédiatement sur le site (démo : stockées dans ce navigateur).`}
        actions={
          <Button variant="rose" onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden /> Nouveau produit
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Rechercher un produit</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cream/40" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="h-12 w-full rounded-sm border border-cream/15 bg-transparent pr-4 pl-10 text-sm" />
        </label>
        <label>
          <span className="sr-only">Filtrer par catégorie</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-12 rounded-sm border border-cream/15 bg-ink-warm px-3 text-sm">
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-sm border border-cream/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-cream/[0.03] text-left text-xs text-cream/55">
            <tr>
              <th className="px-4 py-3 font-semibold">Produit</th>
              <th className="px-4 py-3 font-semibold">Catégorie</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="px-4 py-3 font-semibold">Disponible</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-cream/5">
                <td className="px-4 py-2.5">
                  <span className="font-semibold">{p.name}</span>
                  {p.todo && p.todo.length > 1 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-cheddar" title={p.todo.join("\n")}>
                      <AlertTriangle className="size-3.5" aria-hidden /> à compléter
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-cream/65">{categories.find((c) => c.id === p.category)?.name}</td>
                <td className="px-4 py-2.5">
                  <Price cents={p.price} className="text-sm" />
                </td>
                <td className="px-4 py-1">
                  <Switch checked={p.available} onChange={(v) => setAvailability(p.id, v, p.name)} label={`${p.name} disponible`} srOnlyLabel tone="success" />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button type="button" onClick={() => setEditing(p)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-cream/70 hover:bg-cream/10 hover:text-cream">
                    <Pencil className="size-3.5" aria-hidden /> Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="py-12 text-center text-cream/50">Aucun produit ne correspond.</p>}
      </div>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} labelledBy="product-form-title" className="md:max-w-2xl">
        {editing !== null && <ProductForm key={editing === "new" ? "new" : editing.id} product={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
      </Dialog>
    </>
  );
}
