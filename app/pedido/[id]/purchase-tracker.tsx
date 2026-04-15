"use client";

import { useEffect } from "react";

import { trackPurchase } from "@/lib/analytics";
import { Order } from "@/lib/types";

export function PurchaseTracker({ order }: { order: Order }) {
  useEffect(() => {
    trackPurchase(order.id, order.items, order.totalInCents);
  }, [order]);

  return null;
}
