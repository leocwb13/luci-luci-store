import { redirect } from "next/navigation";

import { AdminFinanceManager } from "@/components/admin-finance-manager";
import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getFinanceEntries, getFinanceSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const canAccess = await ensureRoles(["admin", "financeiro"]);
  if (!canAccess) {
    redirect("/admin/login");
  }

  const [entries, summary] = await Promise.all([getFinanceEntries(), getFinanceSummary()]);

  return (
    <AdminShell title="Financeiro">
      <AdminFinanceManager initialEntries={entries} summary={summary} />
    </AdminShell>
  );
}
