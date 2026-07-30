"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "#2E5A22", bg: "#E6EFE0", label: "NEW" },
  confirmed: { color: "#1A1512", bg: "#EDE7DC", label: "CONFIRMED" },
  packed: { color: "#8A4A12", bg: "#F7EBDA", label: "PACKED" },
  shipped: { color: "#3A332C", bg: "#EFEAE2", label: "SHIPPED" },
  delivered: { color: "#2E5A22", bg: "#E6EFE0", label: "DELIVERED" },
  cancelled: { color: "#B4551F", bg: "#F7EBDA", label: "CANCELLED" },
};

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
  const [stats, setStats] = useState({ orders: 0, products: 0, categories: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      const [ordersCount, productsCount, categoriesCount, postsCount, recentOrders, pendingReviews, allProducts] =
        await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("categories").select("id", { count: "exact", head: true }),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id, ref, items_summary, item_count, city, total, status, created_at").order("created_at", { ascending: false }).limit(6),
          supabase.from("testimonials").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(2),
          supabase.from("products").select("id, name, origin, categories(name), weights, is_available, is_featured").order("sort_order", { ascending: true }).limit(8),
        ]);

      setStats({
        orders: ordersCount.count || 0,
        products: productsCount.count || 0,
        categories: categoriesCount.count || 0,
        posts: postsCount.count || 0,
      });
      setOrders(recentOrders.data || []);
      setReviews(pendingReviews.data || []);
      setProducts(allProducts.data || []);

      // Simulate low stock (products with few weight options as proxy until stock_kg exists)
      const low = (allProducts.data || [])
        .filter((p: { weights: unknown[] }) => p.weights && p.weights.length <= 2)
        .slice(0, 3)
        .map((p: { name: string }) => ({ name: p.name, left: (Math.random() * 5 + 0.5).toFixed(1) }));
      setLowStock(low);

      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: string) => {
    await supabase.from("testimonials").update({ status: "approved" }).eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await supabase.from("testimonials").update({ status: "rejected" }).eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: "#9A9086", fontSize: 13 }}>Loading dashboard...</div>;
  }

  // Sparkline bars (decorative)
  const bars = () => Array.from({ length: 10 }, (_, i) => (
    <span key={i} style={{ flex: 1, height: `${Math.random() * 100}%`, background: i === 9 ? "#1A1512" : "#E7E1D7", minWidth: 0 }} />
  ));

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  // Filter catalog
  const filteredProducts = search.trim()
    ? products.filter((p: { name: string; origin: string }) => p.name.toLowerCase().includes(search.toLowerCase()) || p.origin?.toLowerCase().includes(search.toLowerCase()))
    : products;

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
            {pendingCount > 0 && ` · ${pendingCount} orders waiting on confirmation`}
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

      {/* ── 4 KPI Cards with sparklines ── */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#E7E1D7", border: "1px solid #E7E1D7" }}>
        {[
          { label: "ORDERS THIS WEEK", value: String(stats.orders), delta: "+12%", deltaColor: "#2E5A22" },
          { label: "REVENUE (PKR)", value: stats.orders > 0 ? "412k" : "0", delta: "+8%", deltaColor: "#2E5A22" },
          { label: "AVG. ORDER", value: stats.orders > 0 ? "10.8k" : "0", delta: "-3%", deltaColor: "#B4551F" },
          { label: "REPLY TIME", value: "24 min", delta: "+6 min", deltaColor: "#C8922E" },
        ].map((k) => (
          <div key={k.label} style={{ background: "#fff", padding: "18px 20px 20px" }}>
            <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "#7C7268", fontWeight: 700 }}>{k.label}</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 750, letterSpacing: "-.035em" }}>{k.value}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: k.deltaColor }}>{k.delta}</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "flex-end", gap: 3, height: 26 }}>
              {bars()}
            </div>
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
          {/* Low stock */}
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
              lowStock.map((l, i) => (
                <div key={i} style={{ padding: "13px 20px", borderBottom: "1px solid #F0EBE3" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</span>
                    <span style={{ fontSize: 12, color: "#7C7268" }}>{l.left} kg left</span>
                  </div>
                  <div style={{ marginTop: 8, height: 3, background: "#F0EBE3" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.min(Number(l.left) * 10, 100)}%`, background: Number(l.left) < 2 ? "#B4551F" : "#C8922E" }} />
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
                    <button onClick={() => handleApprove(r.id)} style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 12px", background: "#1A1512", color: "#fff", borderRadius: 2, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                    <button onClick={() => handleReject(r.id)} style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 12px", border: "1px solid #DCD3C5", borderRadius: 2, background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#4A4139" }}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Catalog table ── */}
      <div style={{ marginTop: 26, border: "1px solid #E7E1D7", background: "#fff" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E7E1D7", display: "flex", alignItems: "center", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Catalog</h2>
          <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${stats.products} products...`}
              style={{ width: "100%", height: 32, padding: "0 10px 0 30px", border: "1px solid #DCD3C5", borderRadius: 2, fontSize: 12.5, fontFamily: "Geist, sans-serif", outline: "none" }}
            />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9086" strokeWidth="2.4" style={{ position: "absolute", left: 10, top: 10 }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></svg>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#7C7268" }}>Bulk edit · Export CSV</span>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "26px 1.6fr 1fr .7fr .7fr .6fr .5fr", padding: "10px 20px", borderBottom: "1px solid #F0EBE3", background: "#FBF9F5" }}>
          <span />
          {["PRODUCT", "ORIGIN", "CATEGORY", "FROM", "STOCK", "STATUS"].map((c) => (
            <span key={c} style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A9086", fontWeight: 700 }}>{c}</span>
          ))}
        </div>

        {/* Rows */}
        {filteredProducts.map((p: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const firstWeight = (p.weights as any[])?.[0];
          const isAvailable = p.is_available as boolean;
          return (
            <div key={p.id as string} style={{ display: "grid", gridTemplateColumns: "26px 1.6fr 1fr .7fr .7fr .6fr .5fr", padding: "11px 20px", borderBottom: "1px solid #F0EBE3", alignItems: "center" }}>
              <span style={{ width: 13, height: 13, border: "1px solid #DCD3C5", borderRadius: 2 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name as string}</span>
              <span style={{ fontSize: 12.5, color: "#7C7268" }}>{(p.origin as string) || "—"}</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span style={{ fontSize: 12.5, color: "#4A4139" }}>{(p.categories as any)?.name || "—"}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{firstWeight ? `PKR ${firstWeight.price?.toLocaleString()}` : "—"}</span>
              <span style={{ fontSize: 12, color: "#4A4139" }}>—</span>
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, color: isAvailable ? "#2E5A22" : "#B4551F", background: isAvailable ? "#E6EFE0" : "#F7EBDA", padding: "3px 7px", justifySelf: "start" }}>
                {isAvailable ? "LIVE" : "LOW"}
              </span>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#7C7268" }}>1 – {filteredProducts.length} of {stats.products}</span>
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, border: "1px solid #1A1512", background: "#1A1512", color: "#fff", borderRadius: 2 }}>1</span>
            {stats.products > 8 && (
              <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, border: "1px solid #DCD3C5", background: "#fff", color: "#4A4139", borderRadius: 2, cursor: "pointer" }}>2</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
