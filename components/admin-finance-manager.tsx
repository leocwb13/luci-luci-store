"use client";

import { useMemo, useState } from "react";

import { FinanceEntry, FinanceSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const emptyEntry = {
  kind: "expense" as const,
  category: "Operacional",
  description: "",
  amountInCents: 0,
  status: "pending" as const,
  dueDate: "",
  notes: ""
};

export function AdminFinanceManager({
  initialEntries,
  summary
}: {
  initialEntries: FinanceEntry[];
  summary: FinanceSummary;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [draft, setDraft] = useState<{
    kind: "income" | "expense";
    category: string;
    description: string;
    amountInCents: number;
    status: "pending" | "paid";
    dueDate: string;
    notes: string;
  }>(emptyEntry);
  const [message, setMessage] = useState("");

  const liveSummary = useMemo(() => {
    const revenueInCents = entries.filter((entry) => entry.kind === "income").reduce((total, entry) => total + entry.amountInCents, 0);
    const expensesInCents = entries.filter((entry) => entry.kind === "expense").reduce((total, entry) => total + entry.amountInCents, 0);
    const paidRevenueInCents = entries.filter((entry) => entry.kind === "income" && entry.status === "paid").reduce((total, entry) => total + entry.amountInCents, 0);
    const paidExpensesInCents = entries.filter((entry) => entry.kind === "expense" && entry.status === "paid").reduce((total, entry) => total + entry.amountInCents, 0);
    const pendingRevenueInCents = entries.filter((entry) => entry.kind === "income" && entry.status === "pending").reduce((total, entry) => total + entry.amountInCents, 0);
    const pendingExpensesInCents = entries.filter((entry) => entry.kind === "expense" && entry.status === "pending").reduce((total, entry) => total + entry.amountInCents, 0);

    return {
      revenueInCents,
      expensesInCents,
      paidRevenueInCents,
      paidExpensesInCents,
      pendingRevenueInCents,
      pendingExpensesInCents,
      profitEstimateInCents: revenueInCents - expensesInCents,
      cashFlowInCents: paidRevenueInCents - paidExpensesInCents
    } satisfies FinanceSummary;
  }, [entries]);

  async function saveEntry() {
    const response = await fetch("/api/admin/financeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const data = (await response.json()) as { entries?: FinanceEntry[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel salvar o lancamento.");
      return;
    }
    setEntries(data.entries ?? entries);
    setDraft(emptyEntry);
    setMessage("Lancamento salvo.");
  }

  const headerSummary = entries.length > 0 ? liveSummary : summary;

  return (
    <div className="field-stack">
      <div className="admin-cards">
        <div className="admin-card">
          <p className="section-kicker">Faturamento</p>
          <h2>{formatCurrency(headerSummary.revenueInCents)}</h2>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Despesas</p>
          <h2>{formatCurrency(headerSummary.expensesInCents)}</h2>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Lucro estimado</p>
          <h2>{formatCurrency(headerSummary.profitEstimateInCents)}</h2>
        </div>
        <div className="admin-card">
          <p className="section-kicker">Fluxo de caixa</p>
          <h2>{formatCurrency(headerSummary.cashFlowInCents)}</h2>
        </div>
      </div>

      <div className="checkout-grid">
        <div className="panel field-stack">
          <h2>Novo lancamento</h2>
          <div className="field-group">
            <select className="field-select" value={draft.kind} onChange={(event) => setDraft((current) => ({ ...current, kind: event.target.value as "income" | "expense" }))}>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
            <select className="field-select" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as "pending" | "paid" }))}>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
          <div className="field-group">
            <input className="field" placeholder="Categoria" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} />
            <input className="field" type="number" placeholder="Valor em centavos" value={draft.amountInCents} onChange={(event) => setDraft((current) => ({ ...current, amountInCents: Number(event.target.value) }))} />
          </div>
          <input className="field" placeholder="Descricao" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
          <input className="field" type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
          <textarea className="field-textarea" rows={3} placeholder="Observacoes" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
          {message ? <div className="flash">{message}</div> : null}
          <button className="primary-button" type="button" onClick={saveEntry}>
            Salvar lancamento
          </button>
        </div>

        <div className="table-shell">
          <h2>Contas e fluxo</h2>
          <div className="mobile-admin-list">
            {entries.map((entry) => (
              <div className="summary-card" key={entry.id}>
                <div className="summary-line">
                  <strong>{entry.description}</strong>
                  <span className="pill">{entry.kind === "income" ? "Receita" : "Despesa"}</span>
                </div>
                <div className="list-row">
                  <span>{entry.category}</span>
                  <strong>{formatCurrency(entry.amountInCents)}</strong>
                </div>
                <div className="list-row">
                  <span>Status</span>
                  <span className="pill">{entry.status}</span>
                </div>
                {entry.dueDate ? <p className="muted">Vencimento: {entry.dueDate}</p> : null}
                {entry.notes ? <p className="muted">{entry.notes}</p> : null}
              </div>
            ))}
            {entries.length === 0 ? <p className="muted">Sem lancamentos adicionais no momento.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
