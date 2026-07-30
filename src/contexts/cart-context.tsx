"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string; // cart_items row id (for PATCH/DELETE)
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  origin: string;
  weightGrams: number;
  weightLabel: string;
  price: number;
  currency: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  cartOpen: boolean;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getWhatsAppCheckoutUrl: (whatsappNumber: string) => string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  // Fetch cart from server
  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // Silently fail — user might not be logged in
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      refreshCart();
    }
  }, [refreshCart]);

  // Add item
  const addItem = useCallback(
    async (item: Omit<CartItem, "id" | "quantity">, quantity = 1) => {
      // Optimistic: add locally first
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === item.productId && i.weightGrams === item.weightGrams
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: Math.min(updated[idx].quantity + quantity, 10),
          };
          return updated;
        }
        return [
          ...prev,
          { ...item, id: `temp-${Date.now()}`, quantity: Math.min(quantity, 10) },
        ];
      });

      // Persist to server
      try {
        await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            weightGrams: item.weightGrams,
            weightLabel: item.weightLabel,
            price: item.price,
            currency: item.currency,
            quantity,
          }),
        });
        // Refresh to get real IDs
        await refreshCart();
      } catch {
        // Revert on error
        await refreshCart();
      }
    },
    [refreshCart]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const clamped = Math.max(1, Math.min(quantity, 10));

      // Optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: clamped } : i))
      );

      try {
        await fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: clamped }),
        });
      } catch {
        await refreshCart();
      }
    },
    [refreshCart]
  );

  // Remove item
  const removeItem = useCallback(
    async (itemId: string) => {
      // Optimistic remove
      setItems((prev) => prev.filter((i) => i.id !== itemId));

      try {
        await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      } catch {
        await refreshCart();
      }
    },
    [refreshCart]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    setItems([]);
    try {
      await fetch("/api/cart/clear", { method: "DELETE" });
    } catch {
      await refreshCart();
    }
  }, [refreshCart]);

  // Build WhatsApp message
  const getWhatsAppCheckoutUrl = useCallback(
    (whatsappNumber: string) => {
      if (items.length === 0) return `https://wa.me/${whatsappNumber}`;

      const lines = items
        .map(
          (item, i) =>
            `${i + 1}. *${item.productName}* — ${item.weightLabel} × ${item.quantity} = PKR ${(item.price * item.quantity).toLocaleString()}`
        )
        .join("\n");

      const message = `Assalamualaikum! I'd like to place an order:\n\n${lines}\n\nSubtotal: PKR ${subtotal.toLocaleString()}\n\nPlease confirm availability and total with delivery charges.`;

      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    },
    [items, subtotal]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        cartOpen,
        loading,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        getWhatsAppCheckoutUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
