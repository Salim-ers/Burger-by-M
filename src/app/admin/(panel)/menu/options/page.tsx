import Link from "next/link";
import { getDb } from "@/db/client";
import { requireStaffPage } from "@/lib/auth/guard";
import { adminCatalog } from "@/features/admin/catalog";
import { OptionGroupsEditor } from "@/components/admin/menu/OptionGroupsEditor";
import { PageHeader } from "@/components/admin/primitives";

export const metadata = { title: "Options et suppléments" };

export default async function OptionsPage() {
  await requireStaffPage("owner");
  const { groups } = await adminCatalog(getDb());
  return (
    <div className="space-y-6">
      <Link href="/admin/menu" className="text-xs font-semibold text-sub hover:text-fg">
        ← Carte
      </Link>
      <PageHeader kicker="La carte" title="Options et suppléments" />
      <p className="max-w-2xl text-sm text-sub">Formules, boissons, suppléments (cheddar, bacon, galette…), toppings. Le prix affiché au client et le prix encaissé sont recalculés depuis ces valeurs.</p>
      <OptionGroupsEditor groups={groups} />
    </div>
  );
}
