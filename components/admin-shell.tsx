import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

export async function AdminShell({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const canViewFinance = user?.role === "admin" || user?.role === "financeiro";
  const canManageCatalog = user?.role === "admin" || user?.role === "operacao" || user?.role === "vendedor";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          LUCI<span>|</span>LUCI
        </Link>
        {user ? (
          <div className="panel admin-user-card">
            <strong>{user.name ?? "Equipe Luci Luci"}</strong>
            <span className="pill">{user.role}</span>
          </div>
        ) : null}
        <nav>
          <Link href="/admin">Resumo</Link>
          {canManageCatalog ? <Link href="/admin/produtos">Produtos</Link> : null}
          {canManageCatalog ? <Link href="/admin/kits">Kits</Link> : null}
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/admin/clientes">Clientes</Link>
          {canViewFinance ? <Link href="/admin/financeiro">Financeiro</Link> : null}
          <Link href="/admin/configuracoes">Configurações</Link>
        </nav>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="ghost-button full-width">
            Sair
          </button>
        </form>
      </aside>
      <main className="admin-main">
        <div className="section-heading">
          <p className="section-kicker">Painel</p>
          <h1>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
