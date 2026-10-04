"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import type { AdminGroup, AdminProduct } from "@/features/admin/catalog";
import { archiveProductAction, saveProductAction, uploadProductImageAction } from "@/features/admin/actions/menu";
import { adminButton, adminInput, Panel } from "../primitives";
import { Switch, useNotify } from "../ui";
import { centsToInput, formatPrice, parsePriceInput } from "@/lib/money";
import { cn } from "@/lib/utils";

type Draft = Omit<AdminProduct, "id" | "ingredients"> & { id?: string; ingredients: { id?: string; name: string; isRemovable: boolean }[] };
type BankImage = { src: string; alt: string };

const EMPTY: Draft = {
  name: "",
  slug: "",
  categoryId: "",
  description: null,
  priceCents: null,
  isVisible: true,
  isAvailable: true,
  isBestSeller: false,
  isSpicy: false,
  isVegetarian: false,
  allowNotes: true,
  needsFinalProductPhoto: false,
  allergens: null,
  imageSrc: null,
  imageAlt: "",
  ingredients: [],
  groups: [],
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

/** Création / édition d'un produit : prix, photo, composition, options proposées, statuts. */
export function ProductForm({ product, categories, groups, bank, defaultCategoryId }: { product: AdminProduct | null; categories: { id: string; title: string }[]; groups: AdminGroup[]; bank: BankImage[]; defaultCategoryId?: string }) {
  const router = useRouter();
  const notify = useNotify();
  const [d, setD] = useState<Draft>(() => product ?? { ...EMPTY, categoryId: defaultCategoryId ?? categories[0]?.id ?? "" });
  const [price, setPrice] = useState(centsToInput(product?.priceCents));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const selectedGroups = useMemo(() => new Set(d.groups.map((g) => g.groupId)), [d.groups]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = price.trim() === "" ? null : parsePriceInput(price);
    if (price.trim() !== "" && priceCents === null) {
      notify("Prix invalide (ex. 10,90). Laissez vide si le prix n’est pas confirmé.", "error");
      return;
    }
    setSaving(true);
    const r = await saveProductAction({ ...d, priceCents, description: d.description || null, allergens: d.allergens || null, imageAlt: d.imageAlt || d.name }).catch(() => ({ ok: false as const, error: "Connexion perdue." }));
    setSaving(false);
    if (!r.ok) {
      notify(r.error, "error");
      return;
    }
    notify("Produit enregistré.");
    router.push("/admin/menu");
    router.refresh();
  };

  const upload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    const r = await uploadProductImageAction(form).catch(() => ({ ok: false as const, error: "Envoi impossible." }));
    setUploading(false);
    if (!r.ok || !r.data) {
      notify(r.ok ? "Envoi impossible." : r.error, "error");
      return;
    }
    set("imageSrc", r.data.src);
    set("needsFinalProductPhoto", false);
    notify("Photo importée : pensez à enregistrer.");
  };

  const archive = async () => {
    if (!d.id || !window.confirm(`Retirer « ${d.name} » de la carte ? Il ne sera plus visible ni commandable.`)) return;
    const r = await archiveProductAction(d.id);
    if (!r.ok) return notify(r.error, "error");
    notify("Produit retiré de la carte.");
    router.push("/admin/menu");
    router.refresh();
  };

  const moveIngredient = (i: number, dir: -1 | 1) => {
    const list = [...d.ingredients];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j]!, list[i]!];
    set("ingredients", list);
  };

  const toggleGroup = (groupId: string) => set("groups", selectedGroups.has(groupId) ? d.groups.filter((g) => g.groupId !== groupId) : [...d.groups, { groupId, visibleWhenModifierId: null }]);

  // Options déclenchantes possibles : celles des autres groupes sélectionnés (ex. « En menu »).
  const triggerOptions = (groupId: string) => groups.filter((g) => g.id !== groupId && selectedGroups.has(g.id)).flatMap((g) => g.modifiers.filter((m) => m.isActive).map((m) => ({ id: m.id, label: `${g.name} : ${m.name}` })));

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Panel title="Produit">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs text-sub">
              Nom
              <input
                required
                minLength={2}
                maxLength={80}
                value={d.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setD((x) => ({ ...x, name, ...(slugTouched ? {} : { slug: slugify(name) }) }));
                }}
                className={cn(adminInput, "mt-1")}
              />
            </label>
            <label className="text-xs text-sub">
              Adresse de la page (/menu/…)
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={80}
                value={d.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase());
                }}
                className={cn(adminInput, "mt-1 font-mono text-sm")}
              />
            </label>
            <label className="text-xs text-sub">
              Catégorie
              <select value={d.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={cn(adminInput, "mt-1")}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-sub">
              Prix (€)
              <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Vide = prix non confirmé (non commandable)" className={cn(adminInput, "mt-1 tabular-nums")} />
            </label>
            <label className="text-xs text-sub md:col-span-2">
              Description complémentaire (facultatif)
              <textarea value={d.description ?? ""} onChange={(e) => set("description", e.target.value)} maxLength={400} rows={2} className={cn(adminInput, "mt-1 h-auto py-2")} />
            </label>
            <label className="text-xs text-sub md:col-span-2">
              Allergènes (facultatif — sinon « liste disponible au restaurant »)
              <input value={d.allergens ?? ""} onChange={(e) => set("allergens", e.target.value)} maxLength={400} placeholder="Ex. : gluten, lait, œuf, moutarde, sésame" className={cn(adminInput, "mt-1")} />
            </label>
          </div>
        </Panel>

        <Panel title="Composition">
          <p className="mb-3 text-xs text-sub">Les ingrédients « retirables » apparaissent dans « Retirer » sur la fiche produit (ex. « Sans oignons »).</p>
          <ul className="divide-y divide-rule border-y border-rule">
            {d.ingredients.map((ing, i) => (
              <li key={ing.id ?? `new-${i}`} className="flex items-center gap-2 py-2">
                <input
                  value={ing.name}
                  onChange={(e) => set("ingredients", d.ingredients.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  maxLength={80}
                  aria-label={`Ingrédient ${i + 1}`}
                  className={cn(adminInput, "h-10 flex-1")}
                />
                <label className="flex items-center gap-2 text-xs text-sub">
                  <Switch checked={ing.isRemovable} onChange={(v) => set("ingredients", d.ingredients.map((x, j) => (j === i ? { ...x, isRemovable: v } : x)))} label={`${ing.name} retirable`} />
                  Retirable
                </label>
                <button type="button" onClick={() => moveIngredient(i, -1)} disabled={i === 0} className="grid size-9 place-items-center text-sub hover:text-fg disabled:opacity-30" aria-label="Monter">
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => moveIngredient(i, 1)} disabled={i === d.ingredients.length - 1} className="grid size-9 place-items-center text-sub hover:text-fg disabled:opacity-30" aria-label="Descendre">
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => set("ingredients", d.ingredients.filter((_, j) => j !== i))} className="grid size-9 place-items-center text-sub hover:text-[#f08a7e]" aria-label={`Supprimer ${ing.name}`}>
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newIngredient.trim()) {
                    set("ingredients", [...d.ingredients, { name: newIngredient.trim(), isRemovable: true }]);
                    setNewIngredient("");
                  }
                }
              }}
              placeholder="Ajouter un ingrédient"
              maxLength={80}
              className={adminInput}
            />
            <button
              type="button"
              disabled={!newIngredient.trim() || d.ingredients.length >= 20}
              onClick={() => {
                set("ingredients", [...d.ingredients, { name: newIngredient.trim(), isRemovable: true }]);
                setNewIngredient("");
              }}
              className={adminButton("ghost")}
            >
              Ajouter
            </button>
          </div>
        </Panel>

        <Panel title="Options proposées">
          <p className="mb-3 text-xs text-sub">Groupes d’options affichés sur la fiche (formule, boisson, suppléments…). Les prix des options se modifient dans « Options et suppléments ».</p>
          <ul className="space-y-2">
            {groups.map((g) => {
              const selected = selectedGroups.has(g.id);
              const link = d.groups.find((x) => x.groupId === g.id);
              const triggers = selected ? triggerOptions(g.id) : [];
              return (
                <li key={g.id} className={cn("border px-3 py-2.5", selected ? "border-fg/40" : "border-rule")}>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={selected} onChange={() => toggleGroup(g.id)} className="size-4 accent-[#c7a66a]" />
                    <span className="font-semibold">{g.name}</span>
                    <span className="text-xs text-sub">
                      {g.selectionType === "single" ? "choix unique" : "choix multiple"}
                      {g.minSelect > 0 ? " · obligatoire" : ""} · {g.modifiers.filter((m) => m.isActive).map((m) => (m.priceDeltaCents ? `${m.name} +${formatPrice(m.priceDeltaCents)}` : m.name)).slice(0, 4).join(", ")}
                      {g.modifiers.length > 4 ? "…" : ""}
                    </span>
                  </label>
                  {selected && triggers.length > 0 && (
                    <label className="mt-2 flex items-center gap-2 pl-7 text-xs text-sub">
                      Afficher seulement si :
                      <select
                        value={link?.visibleWhenModifierId ?? ""}
                        onChange={(e) => set("groups", d.groups.map((x) => (x.groupId === g.id ? { ...x, visibleWhenModifierId: e.target.value || null } : x)))}
                        className={cn(adminInput, "h-9 w-auto text-xs")}
                      >
                        <option value="">toujours</option>
                        {triggers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Photo">
          <div className="relative aspect-[3/2] overflow-hidden bg-ink-soft">
            {d.imageSrc ? <Image src={d.imageSrc} alt={d.imageAlt || d.name} fill sizes="400px" className="object-cover" /> : <p className="absolute inset-0 grid place-items-center text-sm text-sub">Aucune photo (visuel neutre affiché)</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={adminButton("ghost", "sm")}>
              <Upload className="size-3.5" aria-hidden /> {uploading ? "Envoi…" : "Importer"}
            </button>
            <button type="button" onClick={() => setShowBank((v) => !v)} className={adminButton("ghost", "sm")}>
              Banque d’images
            </button>
            {d.imageSrc && (
              <button type="button" onClick={() => set("imageSrc", null)} className={adminButton("danger", "sm")}>
                Retirer
              </button>
            )}
          </div>
          {showBank && (
            <div className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
              {bank.map((b) => (
                <button
                  key={b.src}
                  type="button"
                  onClick={() => {
                    set("imageSrc", b.src);
                    if (!d.imageAlt) set("imageAlt", b.alt);
                    setShowBank(false);
                  }}
                  className={cn("relative aspect-square overflow-hidden border", d.imageSrc === b.src ? "border-brass" : "border-transparent")}
                  title={b.alt}
                >
                  <Image src={b.src} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <label className="mt-4 block text-xs text-sub">
            Texte alternatif (accessibilité, SEO)
            <input value={d.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} maxLength={200} className={cn(adminInput, "mt-1")} />
          </label>
          <label className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span>
              Photo d’illustration
              <span className="block text-xs text-sub">La photo ne montre pas exactement ce produit (mention affichée).</span>
            </span>
            <Switch checked={d.needsFinalProductPhoto} onChange={(v) => set("needsFinalProductPhoto", v)} label="Photo d’illustration" />
          </label>
        </Panel>

        <Panel title="Statut">
          <div className="space-y-4 text-sm">
            {(
              [
                ["isVisible", "Visible sur la carte", "Décoché : masqué du site."],
                ["isAvailable", "Disponible", "Décoché : « Épuisé », commande bloquée."],
                ["isBestSeller", "Best-seller", "Mis en avant sur la carte."],
                ["isSpicy", "Épicé", ""],
                ["isVegetarian", "Végétarien", ""],
                ["allowNotes", "Précision libre du client", "« Sauce à part »…"],
              ] as const
            ).map(([key, label, help]) => (
              <label key={key} className="flex items-center justify-between gap-3">
                <span>
                  {label}
                  {help && <span className="block text-xs text-sub">{help}</span>}
                </span>
                <Switch checked={d[key]} onChange={(v) => set(key, v)} label={label} />
              </label>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-2">
          <button type="submit" disabled={saving} className={adminButton("primary", "lg")}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => router.push("/admin/menu")} className={adminButton("ghost")}>
            Annuler
          </button>
          {d.id && (
            <button type="button" onClick={archive} className={adminButton("danger")}>
              Retirer de la carte
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
