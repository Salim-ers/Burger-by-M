import { requireStaffPage } from "@/lib/auth/guard";

/** Écran cuisine : plein écran, sans menu latéral (tablette). */
export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  await requireStaffPage();
  return children;
}
