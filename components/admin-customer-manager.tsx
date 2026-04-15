"use client";

import { useState } from "react";

import { CustomerSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const emptyCustomer = {
  name: "",
  whatsapp: "",
  email: "",
  address: "",
  neighborhood: "",
  deliveryMethod: "delivery" as const,
  notes: ""
};

export function AdminCustomerManager({ initialCustomers }: { initialCustomers: CustomerSummary[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [draft, setDraft] = useState<{
    name: string;
    whatsapp: string;
    email: string;
    address: string;
    neighborhood: string;
    deliveryMethod: "delivery" | "pickup";
    notes: string;
  }>(emptyCustomer);
  const [message, setMessage] = useState("");

  async function saveCustomer() {
    const response = await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const data = (await response.json()) as { customers?: CustomerSummary[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel salvar o cliente.");
      return;
    }
    setCustomers(data.customers ?? customers);
    setDraft(emptyCustomer);
    setMessage("Cliente salvo com sucesso.");
  }

  return (
    <div className="checkout-grid">
      <div className="panel field-stack">
        <h2>Novo cliente</h2>
        <input className="field" placeholder="Nome" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        <div className="field-group">
          <input className="field" placeholder="Telefone / WhatsApp" value={draft.whatsapp} onChange={(event) => setDraft((current) => ({ ...current, whatsapp: event.target.value }))} />
          <input className="field" placeholder="Email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
        </div>
        <div className="field-group">
          <input className="field" placeholder="Bairro" value={draft.neighborhood} onChange={(event) => setDraft((current) => ({ ...current, neighborhood: event.target.value }))} />
          <select className="field-select" value={draft.deliveryMethod} onChange={(event) => setDraft((current) => ({ ...current, deliveryMethod: event.target.value as "delivery" | "pickup" }))}>
            <option value="delivery">Entrega</option>
            <option value="pickup">Retirada</option>
          </select>
        </div>
        <textarea className="field-textarea" rows={3} placeholder="Endereco" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} />
        <textarea className="field-textarea" rows={3} placeholder="Observacoes" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
        {message ? <div className="flash">{message}</div> : null}
        <button className="primary-button" type="button" onClick={saveCustomer}>
          Salvar cliente
        </button>
      </div>

      <div className="table-shell">
        <h2>Clientes cadastrados</h2>
        <div className="mobile-admin-list">
          {customers.map((customer) => (
            <div className="summary-card" key={customer.id ?? customer.whatsapp}>
              <div className="summary-line">
                <strong>{customer.name}</strong>
                <span className="pill">{customer.totalOrders} pedidos</span>
              </div>
              <p className="muted">{customer.whatsapp}</p>
              <p className="muted">{customer.address}</p>
              <div className="list-row">
                <span>Total comprado</span>
                <strong>{formatCurrency(customer.totalSpentInCents)}</strong>
              </div>
              {customer.notes ? <p className="muted">{customer.notes}</p> : null}
            </div>
          ))}
          {customers.length === 0 ? <p className="muted">Nenhum cliente cadastrado ainda.</p> : null}
        </div>
      </div>
    </div>
  );
}
