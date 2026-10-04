import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db/client";
import { requireStaffPage } from "@/lib/auth/guard";
import { adminCatalog, adminProduct } from "@/features/admin/catalog";
import { imageBank } from "@/features/admin/bank";
import { ProductForm } from "@/components/admin/menu/ProductForm";
import { PageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Modifier un produit" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage("owner");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const [product, catalog] = await Promise.all([adminProduct(db, id), adminCatalog(db)]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/menu" className="text-xs font-semibold text-sub hover:text-fg">
        ← Carte
      </Link>
      <PageHeader kicker="La carte" title={product.name}>
        <Link href={`/menu/${product.slug}`} target="_blank" className="text-xs font-semibold text-sub hover:text-fg">
          Voir sur le site ↗
        </Link>
      </PageHeader>
      <ProductForm product={product} categories={catalog.categories.map((c) => ({ id: c.id, title: c.title }))} groups={catalog.groups} bank={imageBank} />
    </div>
  );
}
