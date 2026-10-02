"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { useMenuCategories, useMenuProducts } from "@/hooks/use-menu";

export default function AdminMenuPage() {
  const products = useMenuProducts();
  const categories = useMenuCategories();
  return (
    <>
      <PageHeader
        title="La carte"
        text="Vue d’ensemble telle qu’elle apparaît aux clients. Modifiez les produits, catégories et disponibilités depuis les sections dédiées."
        actions={
          <Link href="/menu" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-sm border border-edge px-4 text-xs font-bold uppercase hover:border-edge/600">
            <ExternalLink className="size-4" aria-hidden /> Voir la carte publique
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {categories.map((c) => (
          <section key={c.id} className="rounded-sm border border-edge bg-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{c.name}</h2>
              {!c.active && <Badge tone="danger">Masquée</Badge>}
            </div>
            {c.note && <p className="text-xs text-cream/50">{c.note}</p>}
            <ul className="mt-4 divide-y divide-edge">
              {products
                .filter((p) => p.category === c.id)
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className={p.available ? "" : "text-cream/40 line-through"}>{p.name}</span>
                    <Price cents={p.price} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
