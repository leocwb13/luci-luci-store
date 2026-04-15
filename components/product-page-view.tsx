"use client";

import { useEffect } from "react";

import { trackViewItem } from "@/lib/analytics";
import { Kit, Product } from "@/lib/types";

export function ProductPageView({ item }: { item: Product | Kit }) {
  useEffect(() => {
    trackViewItem({
      itemId: item.id,
      name: item.name,
      categoryLabel: item.categoryLabel,
      unitPriceInCents: item.priceInCents ?? 0,
      quantity: 1,
      kind: "compareAtInCents" in item ? "kit" : "product"
    });
  }, [item]);

  return null;
}
