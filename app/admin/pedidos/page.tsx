import { redirect } from "next/navigation";

import { AdminOrderManager } from "@/components/admin-order-manager";
import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getKits, getOrders, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const canAccess = await ensureRoles(["admin", "operacao", "vendedor", "financeiro"]);
  if (!canAccess) {
    redirect("/admin/login");
  }

  const [orders, products, kits] = await Promise.all([getOrders(), getProducts(), getKits()]);

  return (
    <AdminShell title="Pedidos">
      <AdminOrderManager initialOrders={orders} products={products} kits={kits} />
    </AdminShell>
  );
}
