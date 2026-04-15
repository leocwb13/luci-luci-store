import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { getOrderById, getSettings } from "@/lib/store";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

import { PurchaseTracker } from "./purchase-tracker";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const [order, settings] = await Promise.all([getOrderById(id), getSettings()]);
  if (!order) notFound();

  const whatsAppUrl = buildWhatsAppUrl(settings, order);
  const approved = payment === "approved" || payment === "success" || order.paymentStatus === "pago";

  return (
    <div className="page-shell">
      <Header settings={settings} />
      {approved ? <PurchaseTracker order={order} /> : null}
      <section className="content-section">
        <div className="panel checkout-panel">
          <div className="section-heading">
            <p className="section-kicker">Pedido {order.id}</p>
            <h1>Pedido criado com sucesso</h1>
            <p className="muted">Status do pagamento: <span className="pill">{payment ?? order.paymentStatus}</span></p>
          </div>

          <div className="summary-list padded-summary">
            {order.items.map((item) => (
              <div key={`${item.kind}-${item.itemId}`} className="summary-card">
                <div className="summary-line">
                  <span>{item.quantity}x {item.name}</span>
                  <strong>{formatCurrency(item.unitPriceInCents * item.quantity)}</strong>
                </div>
                <div className="muted">{item.kind === "kit" ? "Kit" : item.categoryLabel}</div>
              </div>
            ))}
            <div className="summary-box">
              <div className="summary-line summary-line-padded">
                <span>Subtotal</span>
                <strong>{formatCurrency(order.subtotalInCents)}</strong>
              </div>
              <div className="summary-line summary-line-padded">
                <span>Frete</span>
                <strong>
                  {order.deliveryFeeInCents === 0
                    ? (order.customer.deliveryMethod === "pickup" ? "Retirada" : "Grátis 🎉")
                    : formatCurrency(order.deliveryFeeInCents)}
                </strong>
              </div>
              <div className="summary-line summary-total summary-line-padded">
                <span>Total</span>
                <strong>{formatCurrency(order.totalInCents)}</strong>
              </div>
            </div>
          </div>

          <div className="hero-actions" style={{ marginTop: 24 }}>
            <a className="primary-button" href={whatsAppUrl} target="_blank">Continuar no WhatsApp</a>
            <Link className="ghost-button" href="/">Voltar para a loja</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
