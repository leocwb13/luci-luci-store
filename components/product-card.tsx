"use client";

import Link from "next/link";
import type { Route } from "next";

import { trackViewItem } from "@/lib/analytics";
import { Kit, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

type Sellable = Product | Kit;

function isKit(item: Sellable): item is Kit {
  return "compareAtInCents" in item;
}

export function ProductCard({ item }: { item: Sellable }) {
  const { addItem } = useCart();
  const kind = isKit(item) ? "kit" : "product";
  const summary = isKit(item) ? item.shortDescription : item.shortDescription;
  const price = item.priceInCents ?? 0;
  const href = (kind === "kit" ? `/kits/${item.slug}` : `/produtos/${item.slug}`) as Route;

  return (
    <article className="product-card">
      {"badge" in item && item.badge ? (
        <span className={`badge ${item.badgeVariant === "new" ? "badge-new" : ""}`}>{item.badge}</span>
      ) : null}
      {isKit(item) ? <span className="badge badge-soft">Kit</span> : null}
      <div className="product-media" style={{ background: item.background }}>
        {item.imageUrl ? (
          <img className="product-image" src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="placeholder-tube" style={{ borderColor: item.accent }}>
            {item.imageLabel.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}
      </div>
      <div className="product-content">
        <p className="eyebrow" style={{ color: item.accent }}>
          {item.categoryLabel}
        </p>
        <h3>{item.name}</h3>
        <p className="muted">{summary}</p>
        <div className="product-meta">
          <div>
            <strong>{formatCurrency(price)}</strong>
            <small>{isKit(item) ? `Economia de ${formatCurrency(item.savingsInCents)}` : item.packageLabel}</small>
          </div>
          {!isKit(item) ? (
            <span className={`stock ${item.stock > 0 ? "in-stock" : "out-stock"}`}>
              {item.stock > 0 ? "Em estoque" : "Indisponível"}
            </span>
          ) : (
            <span className="stock in-stock">{item.savingsPercent}% off</span>
          )}
        </div>
        <div className="product-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() =>
              addItem({
                kind,
                itemId: item.id,
                slug: item.slug,
                name: item.name,
                categoryLabel: item.categoryLabel,
                unitPriceInCents: price,
                packageLabel: isKit(item) ? "Kit completo" : item.packageLabel,
                summary
              })
            }
          >
            Adicionar
          </button>
          <Link className="ghost-button" href={href} onClick={() => trackViewItem({ itemId: item.id, name: item.name, categoryLabel: item.categoryLabel, unitPriceInCents: price, quantity: 1, kind })}>
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
