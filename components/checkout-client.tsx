"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

import { trackBeginCheckout, trackPurchaseIntent } from "@/lib/analytics";
import { PaymentMethod, StoreSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

// Frete fixo R$20 para entrega — futuramente pode ser dinâmico por bairro
const FLAT_DELIVERY_FEE = 2000;

export function CheckoutClient({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const { items, subtotalInCents, updateQuantity, removeItem, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Cidades únicas derivadas dos bairros
  const cities = useMemo(() => {
    const seen = new Set<string>();
    return settings.neighborhoods
      .map((n) => n.city ?? "Curitiba")
      .filter((c) => { if (seen.has(c)) return false; seen.add(c); return true; });
  }, [settings.neighborhoods]);

  const firstCity = cities[0] ?? "Curitiba";
  const [selectedCity, setSelectedCity] = useState(firstCity);

  const neighborhoodsForCity = useMemo(
    () => settings.neighborhoods.filter((n) => (n.city ?? "Curitiba") === selectedCity),
    [settings.neighborhoods, selectedCity]
  );

  const [customer, setCustomer] = useState({
    name: "",
    whatsapp: "",
    email: "",
    address: "",
    neighborhood: neighborhoodsForCity[0]?.name ?? "",
    deliveryMethod: "delivery"
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercado_pago");

  // Atualiza bairro ao trocar cidade
  function handleCityChange(city: string) {
    setSelectedCity(city);
    const firstNeighborhood = settings.neighborhoods.find((n) => (n.city ?? "Curitiba") === city)?.name ?? "";
    setCustomer((current) => ({ ...current, neighborhood: firstNeighborhood }));
  }

  useEffect(() => {
    if (items.length > 0) trackBeginCheckout(items, subtotalInCents);
  }, [items, subtotalInCents]);

  const threshold = settings.freeShippingThresholdInCents ?? 0;
  const hasFreeShipping = threshold > 0 && subtotalInCents >= threshold;

  const deliveryFee = useMemo(() => {
    if (customer.deliveryMethod === "pickup") return 0;
    if (hasFreeShipping) return 0;
    return FLAT_DELIVERY_FEE;
  }, [customer.deliveryMethod, hasFreeShipping]);

  const total = subtotalInCents + deliveryFee;
  const missingForFreeShipping = threshold > 0 && !hasFreeShipping ? threshold - subtotalInCents : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) {
      setError("Adicione pelo menos um item antes de finalizar.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        items,
        deliveryFeeInCents: deliveryFee,
        paymentMethod
      })
    });

    const data = (await response.json()) as { orderId?: string; error?: string; checkoutUrl?: string };
    if (!response.ok || !data.orderId) {
      setError(data.error ?? "Nao foi possivel criar o pedido.");
      setIsSubmitting(false);
      return;
    }

    trackPurchaseIntent(data.orderId, items, total);
    clearCart();
    const fallbackRoute = `/pedido/${data.orderId}` as Route;
    if (data.checkoutUrl && data.checkoutUrl.startsWith("/")) {
      router.push(data.checkoutUrl as Route);
      return;
    }
    if (data.checkoutUrl) {
      window.location.assign(data.checkoutUrl);
      return;
    }
    router.push(fallbackRoute);
  }

  return (
    <div className="checkout-grid checkout-grid-balanced">
      <form className="panel field-stack checkout-panel" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="section-kicker">Checkout</p>
          <h1>Dados do pedido</h1>
        </div>
        <div className="field-group">
          <input className="field" placeholder="Nome completo" value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} required />
          <input className="field" placeholder="WhatsApp" value={customer.whatsapp} onChange={(event) => setCustomer((current) => ({ ...current, whatsapp: event.target.value }))} required />
        </div>
        <input className="field" placeholder="Email (opcional)" value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} />

        {/* Tipo de entrega */}
        <select className="field-select" value={customer.deliveryMethod} onChange={(event) => setCustomer((current) => ({ ...current, deliveryMethod: event.target.value as "delivery" | "pickup" }))}>
          <option value="delivery">Entrega em domicílio</option>
          <option value="pickup">Retirada no local</option>
        </select>

        {/* Cidade e Bairro (apenas para entrega) */}
        {customer.deliveryMethod === "delivery" && (
          <div className="field-group">
            <select
              className="field-select"
              value={selectedCity}
              onChange={(event) => handleCityChange(event.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              className="field-select"
              value={customer.neighborhood}
              onChange={(event) => setCustomer((current) => ({ ...current, neighborhood: event.target.value }))}
            >
              {neighborhoodsForCity.map((entry) => (
                <option key={entry.name} value={entry.name}>{entry.name}</option>
              ))}
            </select>
          </div>
        )}

        <select className="field-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
          <option value="mercado_pago">Mercado Pago</option>
          <option value="pix">Pix</option>
          <option value="transferencia">Transferência</option>
          <option value="dinheiro">Dinheiro</option>
        </select>
        <textarea className="field-textarea" placeholder="Endereço completo" rows={4} value={customer.address} onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))} required />
        {error ? <div className="flash">{error}</div> : null}
        <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando pedido..." : "Criar pedido e ir para pagamento"}
        </button>
      </form>

      <aside className="panel checkout-panel checkout-summary-panel">
        <div className="section-heading">
          <p className="section-kicker">Resumo</p>
          <h2>Seu carrinho</h2>
        </div>
        <div className="summary-list padded-summary">
          {items.map((item) => (
            <div className="summary-card" key={`${item.kind}-${item.itemId}`}>
              <div className="list-row">
                <div>
                  <strong>{item.name}</strong>
                  <div className="muted">{item.kind === "kit" ? "Kit" : item.categoryLabel}</div>
                </div>
                <span>{formatCurrency(item.unitPriceInCents * item.quantity)}</span>
              </div>
              <div className="list-row">
                <div className="quantity-controls">
                  <button className="ghost-button circle-button" type="button" onClick={() => updateQuantity(item.itemId, item.kind, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="ghost-button circle-button" type="button" onClick={() => updateQuantity(item.itemId, item.kind, item.quantity + 1)}>+</button>
                </div>
                <button className="danger-button" type="button" onClick={() => removeItem(item.itemId, item.kind)}>Remover</button>
              </div>
            </div>
          ))}
          {/* Banner frete grátis */}
          {threshold > 0 && customer.deliveryMethod === "delivery" && (
            hasFreeShipping ? (
              <div className="free-shipping-banner free-shipping-active">
                🎉 Frete grátis desbloqueado!
              </div>
            ) : (
              <div className="free-shipping-banner">
                Falta {formatCurrency(missingForFreeShipping)} para frete grátis
              </div>
            )
          )}

          <div className="summary-box">
            <div className="summary-line summary-line-padded">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotalInCents)}</strong>
            </div>
            <div className="summary-line summary-line-padded">
              <span>Entrega</span>
              <strong>
                {customer.deliveryMethod === "pickup"
                  ? "Retirada"
                  : hasFreeShipping
                  ? <span style={{ color: "var(--green-dark)" }}>Grátis 🎉</span>
                  : formatCurrency(deliveryFee)}
              </strong>
            </div>
            <div className="summary-line summary-line-padded">
              <span>Pagamento</span>
              <strong>{paymentMethod.replace("_", " ")}</strong>
            </div>
            <div className="summary-line summary-total summary-line-padded">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
