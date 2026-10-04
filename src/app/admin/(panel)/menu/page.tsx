import Link from "next/link";
import { getDb } from "@/db/client";
import { getStaffSession } from "@/lib/auth/guard";
import { adminCatalog } from "@/features/admin/catalog";
import { MenuManager } from "@/components/admin/menu/MenuManager";
import { PageHeader, adminButton } from "@/components/admin/primitives";

export const metadata = { title: "Carte" };

export default async function AdminMenuPage() {
  const [catalog, user] = await Promise.all([adminCatalog(getDb()), getStaffSession()]);
  const owner = user?.role === "owner";
  return (
    <div className="space-y-8">
      <PageHeader kicker="La carte" title="Produits et disponibilités">
        {owner && (
          <>
            <Link href="/admin/menu/options" className={adminButton("ghost")}>
              Options et suppléments
            </Link>
            <Link href="/admin/menu/products/new" className={adminButton("primary")}>
              + Nouveau produit
            </Link>
          </>
        )}
      </PageHeader>
      <p className="max-w-2xl text-sm text-sub">« Épuisé » bloque immédiatement la commande en ligne du produit (il reste affiché sur la carte). Les modifications sont visibles sur le site dès l’enregistrement.</p>
      <MenuManager catalog={catalog} role={owner ? "owner" : "staff"} />
    </div>
  );
}
