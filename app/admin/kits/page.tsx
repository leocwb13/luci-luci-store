import { redirect } from "next/navigation";

import { AdminKitManager } from "@/components/admin-kit-manager";
import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getKits, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminKitsPage() {
  const canAccess = await ensureRoles(["admin", "operacao", "vendedor"]);
  if (!canAccess) redirect("/admin/login");
  const [kits, products] = await Promise.all([getKits(), getProducts()]);

  return (
    <AdminShell title="Gerenciar kits">
      <AdminKitManager initialKits={kits} products={products} />
    </AdminShell>
  );
}
