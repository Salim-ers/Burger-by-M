import { getDb } from "@/db/client";
import { kitchenOrders } from "@/features/orders/service";
import { KitchenBoard } from "@/components/admin/kitchen/KitchenBoard";

export const metadata = { title: "Cuisine" };

export default async function KitchenPage() {
  const orders = await kitchenOrders(getDb());
  return <KitchenBoard initial={orders} initialServerTime={new Date().toISOString()} />;
}
