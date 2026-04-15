"use client";

import { useState } from "react";

import { StoreSettings } from "@/lib/types";

export function AdminSettingsForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");

  async function saveSettings() {
    const response = await fetch("/api/admin/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    const data = (await response.json()) as { settings?: StoreSettings; error?: string };
    if (!response.ok || !data.settings) {
      setMessage(data.error ?? "Nao foi possivel salvar.");
      return;
    }

    setSettings(data.settings);
    setMessage("Configuracoes atualizadas.");
  }

  return (
    <div className="panel field-stack">
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>Nome da loja</span>
        <input className="field" value={settings.brandName} onChange={(event) => setSettings((current) => ({ ...current, brandName: event.target.value }))} />
      </label>
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>WhatsApp (com DDI, ex: 5541999999999)</span>
        <input className="field" value={settings.whatsapp} onChange={(event) => setSettings((current) => ({ ...current, whatsapp: event.target.value }))} />
      </label>
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>Instagram (URL completa)</span>
        <input className="field" value={settings.instagram} onChange={(event) => setSettings((current) => ({ ...current, instagram: event.target.value }))} />
      </label>
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>Cidade</span>
        <input className="field" value={settings.city} onChange={(event) => setSettings((current) => ({ ...current, city: event.target.value }))} />
      </label>
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>Título do banner principal</span>
        <input className="field" value={settings.heroTitle} onChange={(event) => setSettings((current) => ({ ...current, heroTitle: event.target.value }))} />
      </label>
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>Descrição do banner principal</span>
        <textarea className="field-textarea" rows={3} value={settings.heroDescription} onChange={(event) => setSettings((current) => ({ ...current, heroDescription: event.target.value }))} />
      </label>
      <label className="field-label">
        <span className="muted" style={{ fontSize: "0.8rem" }}>Frete grátis a partir de (R$) — deixe 0 para desativar</span>
        <input
          className="field"
          type="number"
          min={0}
          step={1}
          value={(settings.freeShippingThresholdInCents ?? 0) / 100}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              freeShippingThresholdInCents: Math.round(parseFloat(event.target.value || "0") * 100)
            }))
          }
        />
      </label>
      {message ? <div className="flash">{message}</div> : null}
      <button className="primary-button" type="button" onClick={saveSettings}>
        Salvar configurações
      </button>
    </div>
  );
}
