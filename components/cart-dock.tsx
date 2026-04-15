"use client";

import Link from "next/link";

import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

export function CartDock() {
  const { itemCount, subtotalInCents } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="cart-dock">
      <div>
        <strong>{itemCount} item(ns)</strong>
        <span>{formatCurrency(subtotalInCents)}</span>
      </div>
      <Link className="primary-button" href="/checkout">
        Ir para checkout
      </Link>
    </div>
  );
}
