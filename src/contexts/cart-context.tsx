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
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

const PENDING_ITEM_KEY = "qaaq-pending-cart-item";

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
  /**
   * Auth-aware add. If signed in, adds immediately and returns true.
   * If signed out, stashes the item in sessionStorage, opens the auth
   * modal, and returns false — the item is added after login completes.
   */
  requestAddItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => boolean;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getWhatsAppCheckoutUrl: (whatsappNumber: string, orderRef?: string) => string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, openAuthModal } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);
  const refreshSeqRef = useRef(0);
  const prevUserRef = useRef<typeof user>(null);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  // Fetch cart from server
  const refreshCart = useCallback(async () => {
    const seq = ++refreshSeqRef.current;
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        // Only apply if this is still the latest request
        if (seq === refreshSeqRef.current) setItems([]);
        return;
      }
      const data = await res.json();
      if (seq === refreshSeqRef.current) setItems(data.items || []);
    } catch {
      // Silently fail — user might not be logged in
    } finally {
      if (seq === refreshSeqRef.current) setLoading(false);
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

  // Auth-aware add: signed-out users get the auth modal, and their
  // intended item is stashed so it survives the login round-trip.
  const requestAddItem = useCallback(
    (item: Omit<CartItem, "id" | "quantity">, quantity = 1): boolean => {
      if (user) {
        void addItem(item, quantity);
        return true;
      }
      try {
        sessionStorage.setItem(
          PENDING_ITEM_KEY,
          JSON.stringify({ item, quantity })
        );
      } catch {
        // Storage unavailable — the user just re-adds after login.
      }
      openAuthModal("login");
      return false;
    },
    [user, addItem, openAuthModal]
  );

  // When the user transitions from signed-out to signed-in (modal login
  // or OAuth redirect landing), replay the stashed add-to-cart intent.
  useEffect(() => {
    const hadUser = prevUserRef.current;
    prevUserRef.current = user;
    if (!user || hadUser) return;

    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(PENDING_ITEM_KEY);
      // Clear before the async add so a double-fire can't add twice.
      if (raw) sessionStorage.removeItem(PENDING_ITEM_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as {
        item?: Omit<CartItem, "id" | "quantity">;
        quantity?: number;
      };
      if (!pending?.item?.productId || !pending.item.weightGrams) return;
      // Syncing FROM an external system (sessionStorage stash written
      // before login) — fires once per sign-in, cannot cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void addItem(pending.item, pending.quantity ?? 1);
      toast("Added to your bag", {
        description: `${pending.item.productName} — ${pending.item.weightLabel}`,
        action: {
          label: "View cart",
          onClick: () => setCartOpen(true),
        },
        duration: 3000,
      });
    } catch {
      // Corrupt stash — nothing to restore.
    }
  }, [user, addItem]);

  // Update quantity
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const clamped = Math.max(1, Math.min(quantity, 10));

      // Optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: clamped } : i))
      );

      // Temp rows aren't on the server yet — local update only
      if (itemId.startsWith("temp-")) return;

      try {
        const res = await fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: clamped }),
        });
        if (!res.ok) {
          await refreshCart();
          toast.error("Could not update cart");
        }
      } catch {
        await refreshCart();
        toast.error("Could not update cart");
      }
    },
    [refreshCart]
  );

  // Remove item
  const removeItem = useCallback(
    async (itemId: string) => {
      // Optimistic remove
      setItems((prev) => prev.filter((i) => i.id !== itemId));

      // Temp rows aren't on the server yet — local remove only
      if (itemId.startsWith("temp-")) return;

      try {
        const res = await fetch(`/api/cart/items/${itemId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          await refreshCart();
          toast.error("Could not update cart");
        }
      } catch {
        await refreshCart();
        toast.error("Could not update cart");
      }
    },
    [refreshCart]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    setItems([]);
    try {
      const res = await fetch("/api/cart/clear", { method: "DELETE" });
      if (!res.ok) {
        await refreshCart();
        toast.error("Could not update cart");
      }
    } catch {
      await refreshCart();
      toast.error("Could not update cart");
    }
  }, [refreshCart]);

  // Build WhatsApp message
  const getWhatsAppCheckoutUrl = useCallback(
    (whatsappNumber: string, orderRef?: string) => {
      if (items.length === 0) return `https://wa.me/${whatsappNumber}`;

      const lines = items
        .map(
          (item, i) =>
            `${i + 1}. *${item.productName}* — ${item.weightLabel} × ${item.quantity} = PKR ${(item.price * item.quantity).toLocaleString()}`
        )
        .join("\n");

      const greeting = orderRef
        ? `Assalamualaikum! Order ref: *${orderRef}*\nI'd like to place an order:`
        : "Assalamualaikum! I'd like to place an order:";

      const message = `${greeting}\n\n${lines}\n\nSubtotal: PKR ${subtotal.toLocaleString()}\n\nPlease confirm availability and total with delivery charges.`;

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
        requestAddItem,
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
