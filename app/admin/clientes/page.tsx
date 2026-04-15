import { redirect } from "next/navigation";

import { AdminCustomerManager } from "@/components/admin-customer-manager";
import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getCustomers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const canAccess = await ensureRoles(["admin", "operacao", "vendedor", "financeiro", "familiar_viewer"]);
  if (!canAccess) {
    redirect("/admin/login");
  }

  const customers = await getCustomers();

  return (
    <AdminShell title="Clientes">
      <AdminCustomerManager initialCustomers={customers} />
    </AdminShell>
  );
}
