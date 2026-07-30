"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

/**
 * Bridges auth state → cart state.
 * Refreshes the cart from Supabase when user logs in or out.
 */
export function CartSync() {
  const { user, loading } = useAuth();
  const { refreshCart } = useCart();
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const currentId = user?.id ?? null;
    if (currentId !== prevUserId.current) {
      prevUserId.current = currentId;
      refreshCart();
    }
  }, [user, loading, refreshCart]);

  return null;
}
