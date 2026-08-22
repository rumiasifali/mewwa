"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";

const C = {
  ink: "#1A1512",
  gold: "#C8922E",
  line: "#E7E1D7",
  line3: "#DCD3C5",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
} as const;

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  pending: { color: "#B4551F", bg: "#F7EBDA" },
  confirmed: { color: "#1A1512", bg: "#EDE7DC" },
  packed: { color: "#3A332C", bg: "#EFEAE2" },
  shipped: { color: "#3A332C", bg: "#EFEAE2" },
  delivered: { color: "#2E5A22", bg: "#E6EFE0" },
  cancelled: { color: "#B4551F", bg: "#F7EBDA" },
};

const FILTERS = ["All", "Processing", "Shipped", "Delivered"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_STATUSES: Record<Filter, string[] | null> = {
  All: null,
  Processing: ["pending", "confirmed", "packed"],
  Shipped: ["shipped"],
  Delivered: ["delivered"],
};

interface Order {
  id: string;
  ref: string;
  items_summary: string | null;
  item_count: number;
  total: number;
  currency: string | null;
  status: string;
  created_at: string;
}

export default function OrderHistoryPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const supabase = createClient();

  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, ref, items_summary, item_count, total, currency, status, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(true);
        toast.error("Couldn't load your orders. Please try again.");
      } else {
        setOrders(data || []);
        setLoadError(false);
      }
      setFetching(false);
    };

    fetchOrders();
  }, [user, authLoading, supabase]);

  // Derived: loading while auth resolves, or while a signed-in
  // user's orders are being fetched. No user => nothing to load.
  const loading = authLoading || (!!user && fetching);

  const countFor = (f: Filter) => {
    const statuses = FILTER_STATUSES[f];
    if (!statuses) return orders.length;
    return orders.filter((o) => statuses.includes(o.status)).length;
  };

  const visibleOrders =
    FILTER_STATUSES[activeFilter] === null
      ? orders
      : orders.filter((o) => FILTER_STATUSES[activeFilter]!.includes(o.status));

  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: ".32em",
          textTransform: "uppercase",
          color: C.gold,
          fontWeight: 700,
        }}
      >
        Your account
      </div>
      <h1
        style={{
          margin: "13px 0 0",
          fontSize: "clamp(28px, 3vw, 38px)",
          lineHeight: 1,
          letterSpacing: "-.04em",
          fontWeight: 800,
        }}
      >
        Order History
      </h1>

      {/* Filter pills */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          gap: 1,
          background: C.line3,
          border: `1px solid ${C.line3}`,
          borderRadius: 2,
          width: "fit-content",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 13px",
              fontSize: 12.5,
              fontWeight: activeFilter === f ? 650 : 500,
              background: activeFilter === f ? C.ink : "#fff",
              color: activeFilter === f ? "#fff" : C.body,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {f}
            {!loading && !loadError && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: activeFilter === f ? C.faint : C.muted2,
                }}
              >
                {countFor(f)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading || authLoading ? (
        <div style={{ marginTop: 22, color: C.muted, fontSize: 13 }}>
          Loading orders...
        </div>
      ) : !user ? (
        <div
          style={{
            marginTop: 22,
            padding: "48px 24px",
            background: "#fff",
            border: `1px solid ${C.line}`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            You&apos;re signed out
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            Sign in to see your order history.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="qaaq-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 42,
              padding: "0 20px",
              marginTop: 16,
              background: C.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign in
          </button>
        </div>
      ) : loadError ? (
        <div
          style={{
            marginTop: 22,
            padding: "48px 24px",
            background: "#fff",
            border: `1px solid ${C.line}`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            Something went wrong
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            We couldn&apos;t load your orders. Please refresh the page to try
            again.
          </p>
        </div>
      ) : visibleOrders.length === 0 ? (
        /* Empty state */
        <div
          style={{
            marginTop: 22,
            padding: "48px 24px",
            background: "#fff",
            border: `1px solid ${C.line}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: `1px solid ${C.line}`,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.faint}
              strokeWidth="1.6"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </div>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 15,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            No orders found
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.6,
              maxWidth: 320,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {activeFilter === "All"
              ? "Your order history will appear here once you place your first order."
              : `No ${activeFilter.toLowerCase()} orders right now.`}
          </p>
          <Link
            href="/products"
            className="qaaq-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 42,
              padding: "0 20px",
              marginTop: 16,
              background: C.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              textDecoration: "none",
            }}
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {visibleOrders.map((o) => (
            <div
              key={o.id}
              style={{
                background: "#fff",
                border: `1px solid ${C.line}`,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 650 }}>
                      {o.ref}
                    </span>
                    <span style={{ fontSize: 12, color: C.muted2 }}>
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {o.items_summary && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 13,
                        color: C.body,
                        lineHeight: 1.5,
                      }}
                    >
                      {o.items_summary}
                    </p>
                  )}
                  <div
                    style={{ marginTop: 6, fontSize: 12, color: C.muted2 }}
                  >
                    {o.item_count} item{o.item_count === 1 ? "" : "s"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      padding: "3px 7px",
                      color: STATUS_STYLES[o.status]?.color || C.ink,
                      background: STATUS_STYLES[o.status]?.bg || "#EDE7DC",
                    }}
                  >
                    {o.status}
                  </span>
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700 }}>
                    {o.currency || "PKR"} {o.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
