import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { ensureRoles } from "@/lib/auth";
import { getDashboardMetrics, getFinanceSummary, getOrders, getProducts, getSettings } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const canAccess = await ensureRoles(["admin", "financeiro", "operacao", "vendedor", "familiar_viewer"]);
  if (!canAccess) {
    redirect("/admin/login");
  }

  const [products, orders, settings, metrics, financeSummary] = await Promise.all([
    getProducts(),
    getOrders(),
    getSettings(),
    getDashboardMetrics(),
    getFinanceSummary()
  ]);
  const paid = orders.filter((order) => order.paymentStatus === "pago").length;

  return (
    <AdminShell title="Resumo da operacao">
      <div className="admin-cards">
        <div className="admin-card">
          <p className="section-kicker">Catalogo</p>
          <h2>{products.length}</h2>
          <p className="muted">Produtos cadastrados na loja.</p>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Pedidos</p>
          <h2>{orders.length}</h2>
          <p className="muted">Pedidos criados pelo checkout.</p>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Pagos</p>
          <h2>{paid}</h2>
          <p className="muted">Pedidos com retorno confirmado.</p>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Vendas do dia</p>
          <h2>{formatCurrency(metrics.salesTodayInCents)}</h2>
          <p className="muted">Receita paga apurada hoje.</p>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Em aberto</p>
          <h2>{metrics.openOrdersCount}</h2>
          <p className="muted">Pedidos ainda em andamento.</p>
        </div>
        <div className="admin-card">
          <p className="section-kicker">A receber</p>
          <h2>{formatCurrency(metrics.receivablesInCents)}</h2>
          <p className="muted">Pedidos e receitas pendentes.</p>
        </div>
      </div>

      <div className="table-shell" style={{ marginTop: 20 }}>
        <h2>Configuracao rapida</h2>
        <div className="admin-list">
          <div className="list-row"><span>Marca</span><strong>{settings.brandName}</strong></div>
          <div className="list-row"><span>WhatsApp</span><strong>{settings.whatsapp}</strong></div>
          <div className="list-row"><span>Cidade</span><strong>{settings.city}</strong></div>
          <div className="list-row"><span>Lucro estimado</span><strong>{formatCurrency(financeSummary.profitEstimateInCents)}</strong></div>
        </div>
      </div>

      <div className="table-shell" style={{ marginTop: 20 }}>
        <h2>Produtos mais vendidos</h2>
        <div className="admin-list">
          {metrics.topProducts.map((entry) => (
            <div className="list-row" key={entry.name}>
              <span>{entry.name}</span>
              <strong>
                {entry.quantity} un. / {formatCurrency(entry.revenueInCents)}
              </strong>
            </div>
          ))}
          {metrics.topProducts.length === 0 ? <p className="muted">Sem vendas pagas suficientes para ranking ainda.</p> : null}
        </div>
      </div>

      <div className="table-shell" style={{ marginTop: 20 }}>
        <h2>Estoque baixo</h2>
        <div className="admin-list">
          {metrics.lowStockProducts.map((product) => (
            <div className="list-row" key={product.id}>
              <span>{product.name}</span>
              <strong>
                {product.stock} / minimo {product.minStock}
              </strong>
            </div>
          ))}
          {metrics.lowStockProducts.length === 0 ? <p className="muted">Nenhum produto abaixo do estoque minimo.</p> : null}
        </div>
      </div>
    </AdminShell>
  );
}
