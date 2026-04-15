import { redirect } from "next/navigation";

import { AdminSettingsForm } from "@/components/admin-settings-form";
import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const canAccess = await ensureRoles(["admin"]);
  if (!canAccess) {
    redirect("/admin/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = (await getSettings()) as any;

  return (
    <AdminShell title="Configuracoes da loja">
      <AdminSettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
