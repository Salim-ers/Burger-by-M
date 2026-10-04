"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import type { AdminCatalog } from "@/features/admin/catalog";
import { moveCategoryAction, moveProductAction, saveCategoryAction, setProductAvailabilityAction } from "@/features/admin/actions/menu";
import { adminButton, adminInput } from "../primitives";
import { Switch, useAction } from "../ui";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

type Category = AdminCatalog["categories"][number];

/** Carte : disponibilités en un geste (équipe), ordre et édition (gérant). */
export function MenuManager({ catalog, role }: { catalog: AdminCatalog; role: "owner" | "staff" }) {
  const owner = role === "owner";
  return (
    <div className="space-y-10">
      {catalog.categories.map((c, i) => (
        <CategoryBlock key={c.id} category={c} owner={owner} first={i === 0} last={i === catalog.categories.length - 1} />
      ))}
    </div>
  );
}

function CategoryBlock({ category: c, owner, first, last }: { category: Category; owner: boolean; first: boolean; last: boolean }) {
  const { exec, pending } = useAction();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: c.name, title: c.title, note: c.note ?? "", isActive: c.isActive });

  return (
    <section aria-labelledby={`cat-${c.id}`} className={cn("border border-rule", !c.isActive && "opacity-60")}>
      <header className="flex flex-wrap items-center gap-3 border-b border-rule bg-panel px-4 py-3">
        <h2 id={`cat-${c.id}`} className="font-serif text-2xl">
          {c.title}
        </h2>
        <span className="text-xs text-sub">
          {c.products.length} produit{c.products.length > 1 ? "s" : ""}
          {!c.isActive && " · catégorie masquée"}
        </span>
        {owner && (
          <div className="ml-auto flex items-center gap-1">
            <button type="button" disabled={pending || first} onClick={() => exec(() => moveCategoryAction(c.id, "up"))} className="grid size-9 place-items-center border border-rule text-sub hover:text-fg disabled:opacity-30" aria-label={`Monter ${c.title}`}>
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button type="button" disabled={pending || last} onClick={() => exec(() => moveCategoryAction(c.id, "down"))} className="grid size-9 place-items-center border border-rule text-sub hover:text-fg disabled:opacity-30" aria-label={`Descendre ${c.title}`}>
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => setEditing((v) => !v)} className={adminButton("ghost", "sm")}>
              {editing ? "Fermer" : "Modifier"}
            </button>
            <Link href={`/admin/menu/products/new?category=${c.id}`} className={adminButton("primary", "sm")}>
              + Produit
            </Link>
          </div>
        )}
      </header>

      {editing && (
        <form
          className="grid gap-3 border-b border-rule px-4 py-4 md:grid-cols-[1fr_1.4fr_2fr_auto_auto] md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void exec(() => saveCategoryAction({ id: c.id, ...form, note: form.note || null }), { success: "Catégorie enregistrée." }).then((r) => r.ok && setEditing(false));
          }}
        >
          <label className="text-xs text-sub">
            Nom court (navigation)
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cn(adminInput, "mt-1")} required minLength={2} maxLength={40} />
          </label>
          <label className="text-xs text-sub">
            Titre de section
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={cn(adminInput, "mt-1")} required minLength={2} maxLength={80} />
          </label>
          <label className="text-xs text-sub">
            Mention (facultatif)
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={cn(adminInput, "mt-1")} maxLength={160} />
          </label>
          <label className="flex h-11 items-center gap-2 text-sm">
            <Switch checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Catégorie visible" /> Visible
          </label>
          <button type="submit" disabled={pending} className={adminButton("primary")}>
            Enregistrer
          </button>
        </form>
      )}

      <ul className="divide-y divide-rule">
        {c.products.map((p, i) => (
          <ProductRow key={p.id} product={p} owner={owner} first={i === 0} last={i === c.products.length - 1} />
        ))}
        {c.products.length === 0 && <li className="px-4 py-6 text-center text-sm text-sub">Aucun produit.</li>}
      </ul>
    </section>
  );
}

function ProductRow({ product: p, owner, first, last }: { product: Category["products"][number]; owner: boolean; first: boolean; last: boolean }) {
  const { exec, pending } = useAction();
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="relative size-14 shrink-0 overflow-hidden bg-ink-soft">{p.image && <Image src={p.image.src} alt="" fill sizes="56px" className="object-cover" />}</div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{p.name}</p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-sub">
          <span className="tabular-nums">{p.priceCents === null ? "Prix non confirmé" : formatPrice(p.priceCents)}</span>
          {!p.isVisible && <span className="text-[#f08a7e]">Masqué</span>}
          {p.isBestSeller && <span className="text-rose">Best-seller</span>}
          {p.needsFinalProductPhoto && <span className="text-brass">Photo d’illustration</span>}
          {!p.image && <span>Sans photo</span>}
        </p>
      </div>
      <label className="flex items-center gap-2.5 text-xs font-bold tracking-[0.12em] uppercase">
        <span className={p.isAvailable ? "text-[#7fd1a5]" : "text-[#f08a7e]"}>{p.isAvailable ? "Disponible" : "Épuisé"}</span>
        <Switch checked={p.isAvailable} disabled={pending} label={`${p.name} disponible`} onChange={(v) => exec(() => setProductAvailabilityAction(p.id, v), { success: `${p.name} : ${v ? "disponible" : "épuisé"}.` })} />
      </label>
      {owner && (
        <div className="flex items-center gap-1">
          <button type="button" disabled={pending || first} onClick={() => exec(() => moveProductAction(p.id, "up"))} className="grid size-9 place-items-center border border-rule text-sub hover:text-fg disabled:opacity-30" aria-label={`Monter ${p.name}`}>
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button type="button" disabled={pending || last} onClick={() => exec(() => moveProductAction(p.id, "down"))} className="grid size-9 place-items-center border border-rule text-sub hover:text-fg disabled:opacity-30" aria-label={`Descendre ${p.name}`}>
            <ArrowDown className="size-4" aria-hidden />
          </button>
          <Link href={`/admin/menu/products/${p.id}`} className="grid size-9 place-items-center border border-rule text-sub hover:text-fg" aria-label={`Modifier ${p.name}`}>
            <Pencil className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </li>
  );
}
