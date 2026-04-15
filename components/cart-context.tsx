"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";
import { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemId: string, kind: CartItem["kind"]) => void;
  updateQuantity: (itemId: string, kind: CartItem["kind"], quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalInCents: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "luci_luci_cart";

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<CartItem>;
  return Boolean(
    candidate.kind &&
      candidate.itemId &&
      candidate.name &&
      typeof candidate.unitPriceInCents === "number" &&
      typeof candidate.quantity === "number" &&
      candidate.quantity > 0
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown[];
      const sanitized = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
      setItems(sanitized);
      if (sanitized.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addItem: (item) => {
        if (!item.kind || !item.itemId || !item.name || !Number.isFinite(item.unitPriceInCents)) {
          return;
        }
        setItems((current) => {
          const existing = current.find(
            (entry) => entry.itemId === item.itemId && entry.kind === item.kind
          );
          if (existing) {
            return current.map((entry) =>
              entry.itemId === item.itemId && entry.kind === item.kind
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry
            );
          }
          const added = { ...item, quantity: 1 };
          trackAddToCart(added);
          return [...current, added];
        });
        setIsDrawerOpen(true);
      },
      removeItem: (itemId, kind) => {
        setItems((current) => {
          const removed = current.find((entry) => entry.itemId === itemId && entry.kind === kind);
          if (removed) trackRemoveFromCart(removed);
          return current.filter((entry) => !(entry.itemId === itemId && entry.kind === kind));
        });
      },
      updateQuantity: (itemId, kind, quantity) => {
        if (quantity < 1) {
          setItems((current) => current.filter((entry) => !(entry.itemId === itemId && entry.kind === kind)));
          return;
        }
        setItems((current) =>
          current.map((entry) =>
            entry.itemId === itemId && entry.kind === kind ? { ...entry, quantity } : entry
          )
        );
      },
      clearCart: () => {
        setItems([]);
        setIsDrawerOpen(false);
      },
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotalInCents: items.reduce(
        (total, item) => total + item.unitPriceInCents * item.quantity,
        0
      ),
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false)
    };
  }, [items, isDrawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
