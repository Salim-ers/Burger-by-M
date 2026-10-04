import { requireStaffPage } from "@/lib/auth/guard";
import { AdminShell } from "@/components/admin/AdminShell";

/** Back-office : session vérifiée côté serveur à chaque requête. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaffPage();
  return <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AdminShell>;
}
