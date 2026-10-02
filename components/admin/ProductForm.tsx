"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import type { CategoryId } from "@/types/category";
import { Field, TextArea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { categories } from "@/data/categories";
import { images } from "@/data/images";
import { productFormSchema, fieldErrors } from "@/lib/validation";
import { useAdminStore } from "@/stores/admin-store";
import { uid } from "@/lib/utils";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const createProduct = useAdminStore((s) => s.createProduct);
  const [v, setV] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price === null || product?.price === undefined ? "" : (product.price / 100).toFixed(2).replace(".", ","),
    category: product?.category ?? "smash",
    image: product?.image ?? "",
    badge: "",
    available: product?.available ?? true,
    popular: product?.popular ?? false,
    vegetarian: product?.vegetarian ?? false,
    spicy: product?.spicy ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = v.price.trim() === "" ? null : Math.round(Number(v.price.replace(",", ".")) * 100);
    if (priceNum !== null && Number.isNaN(priceNum)) return setErrors({ price: "Prix invalide (ex. 11,90)." });
    const parsed = productFormSchema.safeParse({ ...v, slug: v.slug || slugify(v.name), price: priceNum, image: v.image || null });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    const d = parsed.data;
    const patch = { name: d.name, slug: d.slug, description: d.description, price: d.price, category: d.category as CategoryId, image: d.image, available: d.available, popular: d.popular, vegetarian: d.vegetarian, spicy: d.spicy };
    if (product) updateProduct(product.id, patch);
    else createProduct({ ...patch, id: uid(d.slug), new: true, options: [], allergens: null, todo: ["Produit créé depuis le back-office de démonstration"] });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 overflow-y-auto p-6 pt-8 md:grid-cols-2 md:p-8">
      <h2 id="product-form-title" className="font-display text-4xl uppercase md:col-span-2">
        {product ? "Modifier le produit" : "Nouveau produit"}
      </h2>
      <Field label="Nom" id="pf-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} />
      <Field label="Slug (URL)" id="pf-slug" value={v.slug} placeholder={slugify(v.name)} onChange={(e) => setV({ ...v, slug: e.target.value })} error={errors.slug} />
      <TextArea label="Description" id="pf-desc" className="md:col-span-2" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} error={errors.description} />
      <Field label="Prix (€)" id="pf-price" inputMode="decimal" placeholder="Vide = prix à confirmer" value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} error={errors.price} />
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-cat" className="text-[0.78rem] font-semibold opacity-80">
          Catégorie
        </label>
        <select id="pf-cat" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as CategoryId })} className="h-13 rounded-sm border border-edge bg-panel px-3">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-img" className="text-[0.78rem] font-semibold opacity-80">
          Photo
        </label>
        <select id="pf-img" value={v.image} onChange={(e) => setV({ ...v, image: e.target.value })} className="h-13 rounded-sm border border-edge bg-panel px-3">
          <option value="">Aucune (visuel typographique)</option>
          {Object.entries(images).map(([id, img]) => (
            <option key={id} value={id}>
              {img.src.split("/").pop()}
            </option>
          ))}
        </select>
        <p className="text-xs text-bone/45">Upload d’images : prévu avec le futur backend.</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 md:col-span-2">
        <Switch checked={v.available} onChange={(x) => setV({ ...v, available: x })} label="Disponible" tone="success" />
        <Switch checked={v.popular} onChange={(x) => setV({ ...v, popular: x })} label="Best seller" />
        <Switch checked={v.vegetarian} onChange={(x) => setV({ ...v, vegetarian: x })} label="Végétarien" tone="success" />
        <Switch checked={v.spicy} onChange={(x) => setV({ ...v, spicy: x })} label="Épicé" tone="cheddar" />
      </div>
      <div className="flex justify-end gap-3 md:col-span-2">
        <Button variant="outline" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
