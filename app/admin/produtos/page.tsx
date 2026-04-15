import { redirect } from "next/navigation";

import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const canAccess = await ensureRoles(["admin", "operacao", "vendedor"]);
  if (!canAccess) {
    redirect("/admin/login");
  }

  const products = await getProducts();

  return (
    <AdminShell title="Gerenciar produtos">
      <AdminProductManager initialProducts={products} />
    </AdminShell>
  );
}
