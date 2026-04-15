"use client";

import { CartItem, OrderItem, SellableType } from "@/lib/types";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type TrackableItem = {
  itemId: string;
  name: string;
  categoryLabel: string;
  unitPriceInCents: number;
  quantity: number;
  kind: SellableType;
};

function mapItem(item: TrackableItem) {
  return {
    item_id: item.itemId,
    item_name: item.name,
    item_category: item.categoryLabel,
    item_type: item.kind,
    price: item.unitPriceInCents / 100,
    quantity: item.quantity
  };
}

export function trackPageView(path: string) {
  if (GA4_ID && window.gtag) {
    window.gtag("config", GA4_ID, { page_path: path });
  }
  if (META_PIXEL_ID && window.fbq) {
    window.fbq("track", "PageView");
  }
}

export function trackViewItem(item: CartItem | OrderItem | TrackableItem) {
  const payload = mapItem(item);
  if (window.gtag) {
    window.gtag("event", "view_item", { currency: "BRL", value: payload.price, items: [payload] });
  }
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [payload.item_id],
      content_name: payload.item_name,
      content_category: payload.item_category,
      value: payload.price,
      currency: "BRL"
    });
  }
}

export function trackAddToCart(item: CartItem) {
  const payload = mapItem(item);
  if (window.gtag) {
    window.gtag("event", "add_to_cart", { currency: "BRL", value: payload.price, items: [payload] });
  }
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [payload.item_id],
      content_name: payload.item_name,
      value: payload.price,
      currency: "BRL"
    });
  }
}

export function trackRemoveFromCart(item: CartItem) {
  const payload = mapItem(item);
  if (window.gtag) {
    window.gtag("event", "remove_from_cart", { currency: "BRL", value: payload.price, items: [payload] });
  }
}

export function trackBeginCheckout(items: CartItem[], valueInCents: number) {
  const mapped = items.map(mapItem);
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "BRL",
      value: valueInCents / 100,
      items: mapped
    });
  }
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      contents: mapped,
      value: valueInCents / 100,
      currency: "BRL"
    });
  }
}

export function trackPurchaseIntent(orderId: string, items: CartItem[], valueInCents: number) {
  const mapped = items.map(mapItem);
  if (window.gtag) {
    window.gtag("event", "purchase_intent", {
      transaction_id: orderId,
      currency: "BRL",
      value: valueInCents / 100,
      items: mapped
    });
  }
}

export function trackPurchase(orderId: string, items: OrderItem[], valueInCents: number) {
  const dedupeKey = `purchase_tracked_${orderId}`;
  if (window.sessionStorage.getItem(dedupeKey)) return;
  window.sessionStorage.setItem(dedupeKey, "1");

  const mapped = items.map(mapItem);
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderId,
      currency: "BRL",
      value: valueInCents / 100,
      items: mapped
    });
  }
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      contents: mapped,
      value: valueInCents / 100,
      currency: "BRL"
    });
  }
}
