"use client";

import { useState } from "react";
import Link from "next/link";

import { StoreSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

export function Header({ settings }: { settings: StoreSettings }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { itemCount, subtotalInCents, items, isDrawerOpen, openDrawer, closeDrawer, updateQuantity, removeItem } =
    useCart();

  return (
    <>
      <div className="announcement-bar">
        🚚 Frete grátis em compras acima de R$150 · Entrega no mesmo dia em Curitiba e região
      </div>
      <header className="site-header">
        <Link href="/" className="brand">
          LUCI<span>|</span>LUCI
        </Link>
        <nav className="header-nav">
          <a href="/#kits">Kits</a>
          <a href="/#produtos">Produtos</a>
          <a href="/#como-funciona">Como funciona</a>
        </nav>
        <div className="header-actions">
          <button className="ghost-button mobile-nav-button" type="button" onClick={() => setIsMobileNavOpen((current) => !current)}>
            Menu
          </button>
          <a className="ghost-button" href={`https://wa.me/${settings.whatsapp}`} target="_blank">
            WhatsApp
          </a>
          <button className="cart-icon-button" type="button" onClick={openDrawer} aria-label="Abrir carrinho">
            <svg className="cart-icon-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
          </button>
        </div>
      </header>
      {isMobileNavOpen ? (
        <div className="mobile-nav-sheet">
          <a href="#kits" onClick={() => setIsMobileNavOpen(false)}>Kits</a>
          <a href="#produtos" onClick={() => setIsMobileNavOpen(false)}>Produtos</a>
          <a href="#como-funciona" onClick={() => setIsMobileNavOpen(false)}>Como funciona</a>
        </div>
      ) : null}

      <div className={isDrawerOpen ? "cart-overlay open" : "cart-overlay"} onClick={closeDrawer} />
      <aside className={isDrawerOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="drawer-head">
          <div>
            <p className="section-kicker">Carrinho</p>
            <h2>Seu pedido</h2>
          </div>
          <button className="ghost-button" type="button" onClick={closeDrawer}>
            Fechar
          </button>
        </div>

        <div className="drawer-items">
          {items.length === 0 ? (
            <div className="info-card">
              <strong>Seu carrinho esta vazio</strong>
              <p className="muted">Adicione produtos e kits para revisar tudo aqui sem cobrir a pagina.</p>
            </div>
          ) : (
            items.map((item) => (
              <div className="drawer-card" key={`${item.kind}-${item.itemId}`}>
                <div className="drawer-line">
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted">{item.kind === "kit" ? "Kit" : item.categoryLabel}</p>
                  </div>
                  <span>{formatCurrency(item.unitPriceInCents * item.quantity)}</span>
                </div>
                <div className="drawer-line">
                  <div className="quantity-controls">
                    <button type="button" className="ghost-button circle-button" onClick={() => updateQuantity(item.itemId, item.kind, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" className="ghost-button circle-button" onClick={() => updateQuantity(item.itemId, item.kind, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button className="danger-button" type="button" onClick={() => removeItem(item.itemId, item.kind)}>
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div className="summary-line">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotalInCents)}</strong>
          </div>
          <Link className="primary-button full-width" href="/checkout" onClick={closeDrawer}>
            Ir para checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
