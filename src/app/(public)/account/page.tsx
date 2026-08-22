"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";

const C = {
  ink: "#1A1512",
  gold: "#C8922E",
  line: "#E7E1D7",
  line2: "#F0EBE3",
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

interface Order {
  id: string;
  ref: string;
  items_summary: string | null;
  item_count: number;
  total: number;
  status: string;
  created_at: string;
}

export default function AccountPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, ref, items_summary, item_count, total, status, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setOrders(recent || []);

      // Total count
      const { count: total } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id);

      setTotalOrders(total || 0);

      // This month count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthly } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      setThisMonth(monthly || 0);
      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const stats = [
    { label: "Total orders", value: loading ? "—" : String(totalOrders), meta: "All time" },
    {
      label: "This month",
      value: loading ? "—" : String(thisMonth),
      meta: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    },
    { label: "Member since", value: memberSince, meta: "Welcome aboard" },
  ];

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
          fontSize: "clamp(30px, 3.4vw, 42px)",
          lineHeight: 1,
          letterSpacing: "-.045em",
          fontWeight: 800,
        }}
      >
        Welcome back, {firstName}
      </h1>
      <p style={{ margin: "12px 0 0", fontSize: 14.5, color: C.body }}>
        Everything you&apos;ve ordered, and the addresses we ship to.
      </p>

      {/* Stats */}
      <div
        className="qaaq-acct-stats"
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1,
          background: C.line,
          border: `1px solid ${C.line}`,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{ background: "#fff", padding: "18px 18px 20px" }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: C.muted,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: "-.04em",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div style={{ marginTop: 7, fontSize: 11.5, color: C.muted2 }}>
              {s.meta}
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div
        style={{
          marginTop: 36,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          paddingBottom: 14,
          borderBottom: `1px solid ${C.ink}`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 750,
            letterSpacing: "-.03em",
          }}
        >
          Recent orders
        </h2>
        <Link
          href="/account/orders"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            borderBottom: `1px solid ${C.gold}`,
            paddingBottom: 2,
            color: C.ink,
            textDecoration: "none",
          }}
        >
          View all orders
        </Link>
      </div>

      {loading ? (
        <div style={{ marginTop: 16, color: C.muted, fontSize: 13 }}>
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            marginTop: 16,
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
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9.5 8V6a2.5 2.5 0 0 1 5 0v2" />
            </svg>
          </div>
          <p style={{ margin: "16px 0 0", fontSize: 15, fontWeight: 600 }}>
            No orders yet
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            When you place an order, it will show up here.
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
            Browse products
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {orders.map((o) => (
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 650 }}>{o.ref}</span>
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
                    PKR {o.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 639px) {
          .qaaq-acct-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
