"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Search, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/constants";
import { useSiteSettings } from "@/contexts/site-settings-context";
import { toast } from "sonner";

const C = {
  ink: "#1A1512",
  ink2: "#2A211A",
  gold: "#C8922E",
  paper: "#FBF9F5",
  paper2: "#F5F1EA",
  line: "#E7E1D7",
  line2: "#F0EBE3",
  line3: "#DCD3C5",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
  wa: "#1FA855",
  waDark: "#128C4A",
  ok: "#6E7F4E",
} as const;

export function CartDrawer() {
  const { whatsappNumber, freeShippingThreshold } = useSiteSettings();
  const {
    items,
    itemCount,
    subtotal,
    cartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    refreshCart,
    getWhatsAppCheckoutUrl,
  } = useCart();
  const { user, profile } = useAuth();
  const [placing, setPlacing] = useState(false);

  // Place order → create in DB → open WhatsApp
  const handlePlaceOrder = async () => {
    if (items.length === 0 || placing) return;
    setPlacing(true);

    try {
      // Fetch default address for the order snapshot (if any)
      let address = null;
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle();
        address = data;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName:
            profile?.full_name || user?.email?.split("@")[0] || "Customer",
          customerPhone: profile?.phone || null,
          city: address?.city || null,
          addressSnapshot: address || null,
          channel: "whatsapp",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to place order");
        setPlacing(false);
        return;
      }

      // Build WhatsApp URL with order ref (message encoded once, in context)
      const waUrl = getWhatsAppCheckoutUrl(whatsappNumber, data.ref);

      // Refresh cart (now empty) and close drawer
      await refreshCart();
      closeCart();
      toast.success(`Order ${data.ref} placed`);

      // Open WhatsApp — Safari/iOS may block window.open after awaits
      const popup = window.open(waUrl, "_blank");
      if (!popup) {
        toast(`Order ${data.ref} is ready to send`, {
          action: {
            label: "Open WhatsApp",
            onClick: () => window.open(waUrl, "_blank"),
          },
          duration: 60000,
        });
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPlacing(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (cartOpen) {
      window.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const hasFreeShipping = freeShippingThreshold != null && freeShippingThreshold > 0;
  const shippingRemaining = hasFreeShipping ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const freeShippingUnlocked = hasFreeShipping && subtotal >= freeShippingThreshold;
  const shippingProgress = hasFreeShipping
    ? Math.min(100, (subtotal / freeShippingThreshold) * 100)
    : 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 190 }}>
      {/* Scrim */}
      <div
        onClick={closeCart}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20,16,13,.45)",
          animation: "qaaq-fade .18s both",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(424px, 100vw)",
          background: C.paper,
          borderLeft: `1px solid ${C.line}`,
          boxShadow: "-34px 0 70px -30px rgba(26,21,18,.45)",
          display: "flex",
          flexDirection: "column",
          animation: "qaaq-slide-x .34s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 64,
            padding: "0 22px",
            background: "#fff",
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: C.ink,
              }}
            >
              Your Order
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.muted2,
                marginTop: 2,
              }}
            >
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </div>
          </div>
          <button
            onClick={closeCart}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.muted,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Free shipping meter */}
        {items.length > 0 && hasFreeShipping && (
          <div
            style={{
              padding: "12px 22px",
              background: C.paper2,
              borderBottom: `1px solid ${C.line}`,
              flexShrink: 0,
            }}
          >
            <div style={{ height: 3, background: C.line, borderRadius: 2 }}>
              <div
                style={{
                  height: "100%",
                  width: `${shippingProgress}%`,
                  background: freeShippingUnlocked ? C.ok : C.gold,
                  borderRadius: 2,
                  transition: "width .3s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: freeShippingUnlocked ? C.ok : C.body,
                fontWeight: freeShippingUnlocked ? 600 : 400,
              }}
            >
              {freeShippingUnlocked
                ? "Free delivery unlocked"
                : `Add ${formatPrice(shippingRemaining)} more for free delivery`}
            </div>
          </div>
        )}

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.length === 0 ? (
            /* ── EMPTY STATE ── */
            <div
              style={{
                padding: "60px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  border: `1px solid ${C.line3}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag
                  style={{ width: 24, height: 24, color: C.faint }}
                />
              </div>
              <h3
                style={{
                  margin: "22px 0 0",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-.03em",
                }}
              >
                Your cart is empty
              </h3>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 13.5,
                  color: C.muted,
                  lineHeight: 1.6,
                  maxWidth: 280,
                }}
              >
                Browse our collection and add{" "}
                <em
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    color: C.body,
                  }}
                >
                  your favorites.
                </em>
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="qaaq-press"
                style={{
                  marginTop: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 44,
                  padding: "0 22px",
                  background: C.ink,
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  textDecoration: "none",
                }}
              >
                Browse the catalog
              </Link>
            </div>
          ) : (
            /* ── ITEM LIST ── */
            <div>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr auto",
                    gap: 14,
                    padding: "18px 22px",
                    borderBottom: `1px solid ${C.line}`,
                    alignItems: "start",
                  }}
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={closeCart}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          background: C.paper2,
                          borderRadius: 2,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          background: "#EDE7DC",
                          border: "1px solid #E0D8CA",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Search
                          style={{ width: 16, height: 16, color: C.faint }}
                        />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div style={{ minWidth: 0 }}>
                    {item.origin && (
                      <div
                        style={{
                          fontSize: 9.5,
                          letterSpacing: ".14em",
                          textTransform: "uppercase",
                          color: C.muted,
                          fontWeight: 600,
                        }}
                      >
                        {item.origin}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: C.ink,
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.productName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        marginTop: 3,
                      }}
                    >
                      {item.weightLabel}
                    </div>

                    {/* Quantity stepper */}
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${C.line3}`,
                        borderRadius: 2,
                        width: "fit-content",
                      }}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        style={{
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "none",
                          cursor:
                            item.quantity <= 1 ? "not-allowed" : "pointer",
                          color: item.quantity <= 1 ? C.faint : C.body,
                        }}
                      >
                        <Minus style={{ width: 13, height: 13 }} />
                      </button>
                      <span
                        style={{
                          width: 32,
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.ink,
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= 10}
                        style={{
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "none",
                          cursor:
                            item.quantity >= 10 ? "not-allowed" : "pointer",
                          color: item.quantity >= 10 ? C.faint : C.body,
                        }}
                      >
                        <Plus style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>

                  {/* Right column: remove + line total */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.faint,
                        padding: 0,
                        display: "flex",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "#B4551F";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = C.faint;
                      }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.ink,
                        letterSpacing: "-.02em",
                        marginTop: "auto",
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — sticky */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${C.line}`,
              padding: "18px 22px 22px",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: C.body }}>
                Subtotal
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.ink,
                  letterSpacing: "-.02em",
                }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Place order + WhatsApp */}
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="qaaq-press"
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                height: 52,
                width: "100%",
                background: placing ? C.muted2 : C.wa,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 2,
                border: "none",
                cursor: placing ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {placing ? (
                <Loader2 style={{ width: 17, height: 17 }} className="animate-spin" />
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              )}
              {placing
                ? "Placing order..."
                : `Order on WhatsApp (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
            </button>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              style={{
                marginTop: 12,
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                color: C.muted,
                fontFamily: "inherit",
                textAlign: "center",
                textDecoration: "underline",
                textDecorationColor: C.gold,
                textUnderlineOffset: 3,
              }}
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
