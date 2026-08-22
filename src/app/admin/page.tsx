"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  computeDashboardStats,
  percentDelta,
  formatCompact,
  type DashboardStats,
} from "@/lib/admin-stats";

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "#2E5A22", bg: "#E6EFE0", label: "NEW" },
  confirmed: { color: "#1A1512", bg: "#EDE7DC", label: "CONFIRMED" },
  packed: { color: "#8A4A12", bg: "#F7EBDA", label: "PACKED" },
  shipped: { color: "#3A332C", bg: "#EFEAE2", label: "SHIPPED" },
  delivered: { color: "#2E5A22", bg: "#E6EFE0", label: "DELIVERED" },
  cancelled: { color: "#B4551F", bg: "#F7EBDA", label: "CANCELLED" },
};

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboard() {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [weekStats, setWeekStats] = useState<DashboardStats | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState({ products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [
        productsCount,
        pendingOrders,
        recentWindow,
        recentOrders,
        pendingReviews,
        allProducts,
        lowStockRows,
      ] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select("total, status, created_at")
          .gte("created_at", twoWeeksAgo),
        supabase
          .from("orders")
          .select("id, ref, items_summary, item_count, city, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("testimonials")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(2),
        supabase
          .from("products")
          .select("id, name, origin, categories(name), weights, stock, is_available, is_featured")
          .order("sort_order", { ascending: true })
          .limit(8),
        supabase
          .from("products")
          .select("id, name, stock")
          .not("stock", "is", null)
          .lte("stock", LOW_STOCK_THRESHOLD)
          .order("stock", { ascending: true })
          .limit(3),
      ]);

      setStats({ products: productsCount.count || 0 });
      setPendingCount(pendingOrders.count || 0);
      setWeekStats(computeDashboardStats(recentWindow.data || []));
      setOrders(recentOrders.data || []);
      setReviews(pendingReviews.data || []);
      setProducts(allProducts.data || []);
      setLowStock(lowStockRows.data || []);
      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (error) {
      toast.error(`Could not ${status === "approved" ? "approve" : "reject"} review`);
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success(status === "approved" ? "Review approved" : "Review rejected");
  };

  if (loading) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#9A9086", fontSize: 13 }}>Loading dashboard...</div>;
  }

  const sparkline = (values: number[]) => {
    const max = Math.max(...values, 1);
    return values.map((v, i) => (
      <span
        key={i}
        style={{
          flex: 1,
          height: `${Math.max((v / max) * 100, 4)}%`,
          background: i === values.length - 1 ? "#1A1512" : "#E7E1D7",
          minWidth: 0,
        }}
      />
    ));
  };

  const kpis = weekStats
    ? [
        {
          label: "ORDERS (7 DAYS)",
          value: String(weekStats.ordersThisWeek),
          delta: percentDelta(weekStats.ordersThisWeek, weekStats.ordersPrevWeek),
          up: weekStats.ordersThisWeek >= weekStats.ordersPrevWeek,
          bars: weekStats.dailyOrderCounts,
        },
        {
          label: "REVENUE (7 DAYS, PKR)",
          value: formatCompact(weekStats.revenueThisWeek),
          delta: percentDelta(weekStats.revenueThisWeek, weekStats.revenuePrevWeek),
          up: weekStats.revenueThisWeek >= weekStats.revenuePrevWeek,
          bars: weekStats.dailyRevenue,
        },
        {
          label: "AVG. ORDER (PKR)",
          value: formatCompact(weekStats.avgOrderThisWeek),
          delta: percentDelta(weekStats.avgOrderThisWeek, weekStats.avgOrderPrevWeek),
          up: weekStats.avgOrderThisWeek >= weekStats.avgOrderPrevWeek,
          bars: null,
        },
        {
          label: "PENDING ORDERS",
          value: String(pendingCount),
          delta: null,
          up: true,
          bars: null,
        },
      ]
    : [];

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 27, fontWeight: 750, letterSpacing: "-.035em" }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#7C7268" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
            {pendingCount > 0 && ` · ${pendingCount} order${pendingCount === 1 ? "" : "s"} waiting on confirmation`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 16px", border: "1px solid #DCD3C5", background: "#fff", fontSize: 13, fontWeight: 500, borderRadius: 2, textDecoration: "none", color: "#1A1512" }}>
            View site
          </Link>
          <Link href="/admin/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", background: "#1A1512", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 2, textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>
            New product
          </Link>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#E7E1D7", border: "1px solid #E7E1D7" }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "#fff", padding: "18px 20px 20px" }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#7C7268", fontWeight: 700 }}>{k.label}</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 750, letterSpacing: "-.035em" }}>{k.value}</span>
              {k.delta && (
                <span style={{ fontSize: 12, fontWeight: 600, color: k.up ? "#2E5A22" : "#B4551F" }}>{k.delta}</span>
              )}
            </div>
            {k.bars && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "flex-end", gap: 3, height: 26 }}>
                {sparkline(k.bars)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Two columns: Orders + Low stock / Reviews ── */}
      <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, alignItems: "start" }}>
        {/* WhatsApp order queue */}
        <div style={{ border: "1px solid #E7E1D7", background: "#fff" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E7E1D7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>WhatsApp order queue</h2>
            <Link href="/admin/orders" style={{ fontSize: 12, color: "#7C7268", borderBottom: "1px solid #C8922E", textDecoration: "none" }}>All orders</Link>
          </div>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr .8fr .9fr .7fr", padding: "10px 20px", borderBottom: "1px solid #F0EBE3", background: "#FBF9F5" }}>
            {["ORDER", "ITEMS", "CITY", "TOTAL", "STATUS"].map((c) => (
              <span key={c} style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A9086", fontWeight: 700 }}>{c}</span>
            ))}
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#9A9086", fontSize: 13 }}>No orders yet</div>
          ) : (
            orders.map((o) => {
              const st = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
              return (
                <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr .8fr .9fr .7fr", padding: "13px 20px", borderBottom: "1px solid #F0EBE3", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>#{o.ref?.replace("QA-", "")}</span>
                  <span style={{ fontSize: 12.5, color: "#4A4139", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items_summary || "—"}</span>
                  <span style={{ fontSize: 12.5, color: "#4A4139" }}>{o.city || "—"}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>PKR {o.total?.toLocaleString()}</span>
                  <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, color: st.color, background: st.bg, padding: "3px 7px", justifySelf: "start" }}>{st.label}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Low stock + Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Low stock (real `stock` column; products without stock tracking are ignored) */}
          <div style={{ border: "1px solid #E7E1D7", background: "#fff" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E7E1D7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Low stock</h2>
              {lowStock.length > 0 && (
                <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, color: "#B4551F", background: "#F7E8DD", padding: "3px 7px" }}>
                  {lowStock.length} ITEMS
                </span>
              )}
            </div>
            {lowStock.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center", color: "#9A9086", fontSize: 13 }}>All stocked up</div>
            ) : (
              lowStock.map((l) => (
                <div key={l.id} style={{ padding: "13px 20px", borderBottom: "1px solid #F0EBE3" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</span>
                    <span style={{ fontSize: 12, color: "#7C7268" }}>{Number(l.stock).toLocaleString()} kg left</span>
                  </div>
                  <div style={{ marginTop: 8, height: 3, background: "#F0EBE3" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.min(Number(l.stock) * 10, 100)}%`, background: Number(l.stock) < 2 ? "#B4551F" : "#C8922E" }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reviews to approve */}
          <div style={{ border: "1px solid #E7E1D7", background: "#fff" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E7E1D7" }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Reviews to approve</h2>
            </div>
            {reviews.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center", color: "#9A9086", fontSize: 13 }}>All caught up</div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid #F0EBE3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 11.5, color: "#9A9086" }}>{r.location}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#C8922E", fontWeight: 600 }}>{r.rating}★</span>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "#4A4139" }}>
                    {r.content?.length > 140 ? r.content.slice(0, 140) + "..." : r.content}
                  </p>
                  <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                    <button onClick={() => handleReview(r.id, "approved")} style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 12px", background: "#1A1512", color: "#fff", borderRadius: 2, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                    <button onClick={() => handleReview(r.id, "rejected")} style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 12px", border: "1px solid #DCD3C5", borderRadius: 2, background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#4A4139" }}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Recent catalog rows ── */}
      <div style={{ marginTop: 26, border: "1px solid #E7E1D7", background: "#fff" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E7E1D7", display: "flex", alignItems: "center", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Catalog</h2>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#7C7268" }}>
            Showing {products.length} of {stats.products}
          </span>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr .7fr .7fr .6fr .5fr", padding: "10px 20px", borderBottom: "1px solid #F0EBE3", background: "#FBF9F5" }}>
          {["PRODUCT", "ORIGIN", "CATEGORY", "FROM", "STOCK", "STATUS"].map((c) => (
            <span key={c} style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A9086", fontWeight: 700 }}>{c}</span>
          ))}
        </div>

        {/* Rows */}
        {products.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#9A9086", fontSize: 13 }}>No products yet</div>
        ) : (
          products.map((p: Record<string, unknown>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firstWeight = (p.weights as any[])?.[0];
            const isAvailable = p.is_available as boolean;
            return (
              <div key={p.id as string} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr .7fr .7fr .6fr .5fr", padding: "11px 20px", borderBottom: "1px solid #F0EBE3", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name as string}</span>
                <span style={{ fontSize: 12.5, color: "#7C7268" }}>{(p.origin as string) || "—"}</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span style={{ fontSize: 12.5, color: "#4A4139" }}>{(p.categories as any)?.name || "—"}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{firstWeight ? `PKR ${firstWeight.price?.toLocaleString()}` : "—"}</span>
                <span style={{ fontSize: 12, color: "#4A4139" }}>{p.stock != null ? `${Number(p.stock).toLocaleString()} kg` : "—"}</span>
                <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, color: isAvailable ? "#2E5A22" : "#B4551F", background: isAvailable ? "#E6EFE0" : "#F7EBDA", padding: "3px 7px", justifySelf: "start" }}>
                  {isAvailable ? "LIVE" : "UNLISTED"}
                </span>
              </div>
            );
          })
        )}

        {/* Footer */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <Link href="/admin/products" style={{ fontSize: 12, color: "#7C7268", borderBottom: "1px solid #C8922E", textDecoration: "none" }}>
            View all products
          </Link>
        </div>
      </div>
    </div>
  );
}
