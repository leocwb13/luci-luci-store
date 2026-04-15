"use client";

import { useMemo, useState } from "react";

import { Kit, Order, OrderStatus, PaymentMethod, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const statusColumns: Array<{ key: OrderStatus; label: string }> = [
  { key: "pedido_recebido", label: "Pedido recebido" },
  { key: "em_preparacao", label: "Em preparacao" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
  { key: "cancelado", label: "Cancelado" }
];

const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferencia" }
];

export function AdminOrderManager({
  initialOrders,
  products,
  kits
}: {
  initialOrders: Order[];
  products: Product[];
  kits: Kit[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<{
    customerName: string;
    whatsapp: string;
    email: string;
    address: string;
    neighborhood: string;
    deliveryMethod: "delivery" | "pickup";
    deliveryFeeInCents: number;
    paymentMethod: PaymentMethod;
    paymentStatus: Order["paymentStatus"];
    orderStatus: OrderStatus;
    notes: string;
    itemQuantities: Record<string, number>;
  }>({
    customerName: "",
    whatsapp: "",
    email: "",
    address: "",
    neighborhood: "",
    deliveryMethod: "delivery" as const,
    deliveryFeeInCents: 0,
    paymentMethod: "pix" as PaymentMethod,
    paymentStatus: "pendente" as const,
    orderStatus: "pedido_recebido" as OrderStatus,
    notes: "",
    itemQuantities: {} as Record<string, number>
  });

  const sellables = useMemo(
    () => [
      ...products.map((product) => ({
        key: `product:${product.id}`,
        name: product.name,
        kind: "product" as const,
        itemId: product.id,
        slug: product.slug,
        categoryLabel: product.categoryLabel,
        unitPriceInCents: product.priceInCents ?? 0,
        packageLabel: product.packageLabel,
        summary: product.shortDescription
      })),
      ...kits.map((kit) => ({
        key: `kit:${kit.id}`,
        name: kit.name,
        kind: "kit" as const,
        itemId: kit.id,
        slug: kit.slug,
        categoryLabel: kit.categoryLabel,
        unitPriceInCents: kit.priceInCents,
        packageLabel: "Kit completo",
        summary: kit.shortDescription
      }))
    ],
    [kits, products]
  );

  async function updateOrder(id: string, paymentStatus: Order["paymentStatus"], orderStatus: Order["orderStatus"]) {
    const response = await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus, orderStatus })
    });
    const data = (await response.json()) as { orders?: Order[]; error?: string };
    if (!response.ok || !data.orders) {
      setMessage(data.error ?? "Nao foi possivel atualizar o pedido.");
      return;
    }
    setOrders(data.orders);
    setMessage("Pedido atualizado.");
  }

  async function createManualOrder() {
    const items = sellables
      .map((entry) => {
        const quantity = draft.itemQuantities[entry.key] ?? 0;
        if (quantity < 1) return null;
        const matchingKit = entry.kind === "kit" ? kits.find((kit) => kit.id === entry.itemId) : null;
        return {
          kind: entry.kind,
          itemId: entry.itemId,
          slug: entry.slug,
          name: entry.name,
          quantity,
          unitPriceInCents: entry.unitPriceInCents,
          categoryLabel: entry.categoryLabel,
          packageLabel: entry.packageLabel,
          summary: entry.summary,
          kitItems: matchingKit?.items
        };
      })
      .filter(Boolean);

    if (items.length === 0) {
      setMessage("Selecione pelo menos um item para o pedido manual.");
      return;
    }

    const response = await fetch("/api/admin/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: draft.customerName,
          whatsapp: draft.whatsapp,
          email: draft.email,
          address: draft.address,
          neighborhood: draft.neighborhood,
          deliveryMethod: draft.deliveryMethod
        },
        items,
        deliveryFeeInCents: draft.deliveryFeeInCents,
        paymentMethod: draft.paymentMethod,
        paymentStatus: draft.paymentStatus,
        orderStatus: draft.orderStatus,
        notes: draft.notes
      })
    });

    const data = (await response.json()) as { orders?: Order[]; error?: string };
    if (!response.ok || !data.orders) {
      setMessage(data.error ?? "Nao foi possivel criar o pedido manual.");
      return;
    }

    setOrders(data.orders);
    setDraft({
      customerName: "",
      whatsapp: "",
      email: "",
      address: "",
      neighborhood: "",
      deliveryMethod: "delivery",
      deliveryFeeInCents: 0,
      paymentMethod: "pix",
      paymentStatus: "pendente",
      orderStatus: "pedido_recebido",
      notes: "",
      itemQuantities: {}
    });
    setMessage("Pedido manual criado com sucesso.");
  }

  return (
    <div className="field-stack">
      <div className="checkout-grid">
        <div className="panel field-stack">
          <h2>Novo pedido manual</h2>
          <div className="field-group">
            <input className="field" placeholder="Nome do cliente" value={draft.customerName} onChange={(event) => setDraft((current) => ({ ...current, customerName: event.target.value }))} />
            <input className="field" placeholder="WhatsApp" value={draft.whatsapp} onChange={(event) => setDraft((current) => ({ ...current, whatsapp: event.target.value }))} />
          </div>
          <div className="field-group">
            <input className="field" placeholder="Email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
            <input className="field" placeholder="Bairro" value={draft.neighborhood} onChange={(event) => setDraft((current) => ({ ...current, neighborhood: event.target.value }))} />
          </div>
          <textarea className="field-textarea" rows={3} placeholder="Endereco completo" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} />
          <div className="field-group">
            <select className="field-select" value={draft.deliveryMethod} onChange={(event) => setDraft((current) => ({ ...current, deliveryMethod: event.target.value as "delivery" | "pickup" }))}>
              <option value="delivery">Entrega</option>
              <option value="pickup">Retirada</option>
            </select>
            <input className="field" type="number" placeholder="Frete em centavos" value={draft.deliveryFeeInCents} onChange={(event) => setDraft((current) => ({ ...current, deliveryFeeInCents: Number(event.target.value) }))} />
          </div>
          <div className="field-group">
            <select className="field-select" value={draft.paymentMethod} onChange={(event) => setDraft((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))}>
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className="field-select" value={draft.paymentStatus} onChange={(event) => setDraft((current) => ({ ...current, paymentStatus: event.target.value as Order["paymentStatus"] }))}>
              <option value="pendente">Pagamento pendente</option>
              <option value="pago">Pagamento confirmado</option>
              <option value="cancelado">Pagamento cancelado</option>
            </select>
          </div>
          <textarea className="field-textarea" rows={3} placeholder="Observacoes internas" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
          <div className="field-stack">
            <strong>Itens do pedido</strong>
            {sellables.map((entry) => (
              <div className="summary-card" key={entry.key}>
                <div className="summary-line">
                  <div>
                    <strong>{entry.name}</strong>
                    <p className="muted">{entry.kind === "kit" ? "Kit" : entry.categoryLabel}</p>
                  </div>
                  <strong>{formatCurrency(entry.unitPriceInCents)}</strong>
                </div>
                <input
                  className="field"
                  type="number"
                  min={0}
                  value={draft.itemQuantities[entry.key] ?? 0}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      itemQuantities: {
                        ...current.itemQuantities,
                        [entry.key]: Number(event.target.value)
                      }
                    }))
                  }
                />
              </div>
            ))}
          </div>
          {message ? <div className="flash">{message}</div> : null}
          <button className="primary-button" type="button" onClick={createManualOrder}>
            Criar pedido manual
          </button>
        </div>

        <div className="table-shell field-stack">
          <div className="header-actions">
            <button className={view === "kanban" ? "primary-button" : "ghost-button"} type="button" onClick={() => setView("kanban")}>
              Kanban
            </button>
            <button className={view === "table" ? "primary-button" : "ghost-button"} type="button" onClick={() => setView("table")}>
              Lista
            </button>
          </div>

          {view === "table" ? (
            <div className="mobile-admin-list">
              {orders.map((order) => (
                <div className="summary-card" key={order.id}>
                  <div className="summary-line">
                    <strong>{order.id}</strong>
                    <span className="pill">{order.paymentStatus}</span>
                  </div>
                  <p className="muted">{order.customer.name}</p>
                  <div className="list-row">
                    <span>{order.orderStatus}</span>
                    <strong>{formatCurrency(order.totalInCents)}</strong>
                  </div>
                  <div className="header-actions">
                    <button className="ghost-button" type="button" onClick={() => updateOrder(order.id, "pago", "em_preparacao")}>
                      Marcar pago
                    </button>
                    <button className="ghost-button" type="button" onClick={() => updateOrder(order.id, order.paymentStatus, "cancelado")}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="kanban-board">
              {statusColumns.map((column) => (
                <div className="kanban-column" key={column.key}>
                  <div className="kanban-column-head">
                    <strong>{column.label}</strong>
                    <span className="pill">
                      {orders.filter((order) => order.orderStatus === column.key).length}
                    </span>
                  </div>
                  <div className="kanban-cards">
                    {orders
                      .filter((order) => order.orderStatus === column.key)
                      .map((order) => (
                        <div className="summary-card" key={order.id}>
                          <div className="summary-line">
                            <strong>{order.customer.name}</strong>
                            <span className="pill">{order.paymentStatus}</span>
                          </div>
                          <p className="muted">{order.id}</p>
                          <p className="muted">
                            {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                          </p>
                          <div className="list-row">
                            <span>{paymentOptions.find((option) => option.value === order.paymentMethod)?.label ?? order.paymentMethod}</span>
                            <strong>{formatCurrency(order.totalInCents)}</strong>
                          </div>
                          <select
                            className="field-select"
                            value={order.orderStatus}
                            onChange={(event) => updateOrder(order.id, order.paymentStatus, event.target.value as OrderStatus)}
                          >
                            {statusColumns.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
