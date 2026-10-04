import Link from "next/link";
import { getDb } from "@/db/client";
import { requireStaffPage } from "@/lib/auth/guard";
import { adminCatalog } from "@/features/admin/catalog";
import { imageBank } from "@/features/admin/bank";
import { ProductForm } from "@/components/admin/menu/ProductForm";
import { PageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Nouveau produit" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await requireStaffPage("owner");
  const [{ category }, catalog] = await Promise.all([searchParams, adminCatalog(getDb())]);
  return (
    <div className="space-y-6">
      <Link href="/admin/menu" className="text-xs font-semibold text-sub hover:text-fg">
        ← Carte
      </Link>
      <PageHeader kicker="La carte" title="Nouveau produit" />
      <ProductForm product={null} categories={catalog.categories.map((c) => ({ id: c.id, title: c.title }))} groups={catalog.groups} bank={imageBank} defaultCategoryId={catalog.categories.some((c) => c.id === category) ? category : undefined} />
    </div>
  );
}
