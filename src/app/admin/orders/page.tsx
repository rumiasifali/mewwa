"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

interface Order {
  id: string;
  ref: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  city: string | null;
  items_summary: string | null;
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  status: string;
  channel: string;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  weight_label: string;
  price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
  origin: string | null;
}

const STATUSES = ["all", "pending", "confirmed", "packed", "shipped", "delivered"] as const;

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  pending: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};

/* #53 — dot colors per design */
const STATUS_DOT_COLORS: Record<string, string> = {
  pending: "#C8922E",
  confirmed: "#4E7A3E",
  packed: "#4E7A3E",
  shipped: "#4E7A3E",
  delivered: "#C4BAAC",
};

/* #52 — status badge colors per design */
const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  new: { color: "#8A4A12", bg: "#F7EBDA" },
  confirmed: { color: "#2E5A22", bg: "#E6EFE0" },
  packed: { color: "#8A4A12", bg: "#F7EBDA" },
  shipped: { color: "#3A332C", bg: "#EFEAE2" },
  delivered: { color: "#7C7268", bg: "#F3EFE8" },
  cancelled: { color: "#B4551F", bg: "#F7EBDA" },
  pending: { color: "#2E5A22", bg: "#E6EFE0" },
};

const NEXT_STATUS: Record<string, string> = {
  new: "confirmed",
  pending: "confirmed",
  confirmed: "packed",
  packed: "shipped",
  shipped: "delivered",
};

const NEXT_ACTION_LABEL: Record<string, string> = {
  new: "Confirm & send price",
  pending: "Confirm & send price",
  confirmed: "Mark as packed",
  packed: "Mark as shipped",
  shipped: "Mark as delivered",
};

/* #44 — 4 timeline steps with design labels */
const TIMELINE_STEPS = [
  { key: "new", label: "Thread opened" },
  { key: "confirmed", label: "Price confirmed" },
  { key: "packed", label: "Weighed & sealed" },
  { key: "shipped", label: "Handed to courier" },
];

const STATUS_ORDER: Record<string, number> = {
  new: 0,
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
};

const PAGE_SIZE = 8;

/* #14/#55 — grid columns with Items column */
const ORDER_GRID_COLS = "26px 62px minmax(140px,1.15fr) 66px 84px 84px";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // "Synced ago" label — computed when a fetch completes (render must stay
  // pure, so we don't read Date.now() during render).
  const [syncedAgo, setSyncedAgo] = useState("just now");

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
    setSyncedAgo("just now");
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await fetchOrders();
    };
    void load();
  }, [fetchOrders]);

  // Fetch items for selected order (clearing on deselect happens in the
  // click/cancel handlers so the effect only syncs from Supabase)
  useEffect(() => {
    if (!selectedId) return;
    const fetchItems = async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", selectedId);
      setSelectedItems(data || []);
    };
    fetchItems();
  }, [selectedId, supabase]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast.error(`Could not update order: ${error.message}`);
      return;
    }
    fetchOrders();
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm("Cancel this order? This will mark it as cancelled.")) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);
    if (error) {
      toast.error(`Could not cancel order: ${error.message}`);
      return;
    }
    fetchOrders();
    if (selectedId === orderId) {
      setSelectedId(null);
      setSelectedItems([]);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.ref.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.items_summary?.toLowerCase().includes(q)
    );
  });

  const selected = orders.find((o) => o.id === selectedId);
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const totalCount = orders.length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const showFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // Reset to page 1 if the filtered list shrinks below the current page
  // start (render-time state adjustment, avoids an effect pass)
  if (currentPage > 1 && (currentPage - 1) * PAGE_SIZE >= filtered.length) {
    setCurrentPage(1);
  }

  // Timeline helper
  const getTimelineStatus = (stepKey: string, orderStatus: string) => {
    const stepIdx = STATUS_ORDER[stepKey] ?? -1;
    const orderIdx = STATUS_ORDER[orderStatus] ?? -1;
    if (stepIdx < orderIdx) return "done";
    if (stepIdx === orderIdx) return "active";
    return "future";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-.035em",
              lineHeight: 1.15,
              margin: 0,
              color: "#1A1512",
            }}
          >
            Orders
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "#7C7268",
              lineHeight: 1.5,
              margin: "6px 0 0 0",
            }}
          >
            Every order starts as a WhatsApp thread. Confirm it here and the status follows the pouch.
          </p>
        </div>
      </div>

      {/* #3 — Filter tabs + Search row */}
      <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {/* Pill segment bar */}
        <div
          style={{
            display: "flex",
            gap: 1,
            background: "#DCD3C5",
            border: "1px solid #DCD3C5",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* #4 — pill buttons */}
          {STATUSES.map((s) => {
            const count =
              s === "all"
                ? totalCount
                : statusCounts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => {
                  setFilter(s);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "7px 13px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  background: filter === s ? "#1A1512" : "#fff",
                  color: filter === s ? "#fff" : "#4A4139",
                  border: "none",
                  cursor: "pointer",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {STATUS_LABELS[s]}
                {/* #5 — count styling */}
                <span style={{ fontSize: 11, color: filter === s ? "rgba(255,255,255,0.6)" : "#9A9086" }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* #6 — Search */}
        <div style={{ position: "relative", flex: "1", maxWidth: 260 }}>
          {/* #8 — search icon */}
          <svg
            style={{
              position: "absolute",
              left: 10,
              top: 11,
              width: 12,
              height: 12,
              color: "#9A9086",
              pointerEvents: "none",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          {/* #7 — search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Order ref, name or phone..."
            style={{
              width: "100%",
              height: 34,
              paddingLeft: 30,
              paddingRight: 10,
              border: "1px solid #DCD3C5",
              borderRadius: 2,
              fontSize: 12.5,
              fontFamily: "inherit",
              outline: "none",
              color: "#1A1512",
              background: "#fff",
            }}
          />
        </div>

        {/* #9 — Synced text */}
        <span
          style={{
            fontSize: 12,
            color: "#9A9086",
            marginLeft: "auto",
            whiteSpace: "nowrap",
          }}
        >
          Synced with Supabase {syncedAgo}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ marginTop: 32, textAlign: "center", fontSize: 13, color: "#9A9086" }}>
          Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            marginTop: 32,
            textAlign: "center",
            padding: "64px 0",
            border: "1px solid #E0D8CA",
            borderRadius: 2,
            background: "#fff",
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#1A1512" }}>No orders found</p>
          <p style={{ fontSize: 13, color: "#9A9086", marginTop: 6 }}>
            {filter === "all"
              ? "Orders will appear here when customers place them."
              : `No ${(STATUS_LABELS[filter] || filter).toLowerCase()} orders right now.`}
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: 18, /* #10 */
            display: "grid",
            gap: 20,
            alignItems: "start",
            gridTemplateColumns: selected ? "1.55fr 1fr" : "1fr",
          }}
        >
          {/* Left: Order table */}
          {/* #11 — border color, no borderRadius, no overflow */}
          <div
            style={{
              border: "1px solid #E7E1D7",
              background: "#fff",
            }}
          >
            {/* #12/#13/#14 — Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: ORDER_GRID_COLS,
                gap: 14,
                padding: "10px 18px",
                background: "#FBF9F5",
                borderBottom: "1px solid #F0EBE3",
              }}
            >
              <span />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9A9086",
                }}
              >
                Ref
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9A9086",
                }}
              >
                Customer
              </span>
              {/* #14 — Items column */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9A9086",
                }}
              >
                Items
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9A9086",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9A9086",
                }}
              >
                Status
              </span>
            </div>

            {/* Table rows */}
            {paginatedOrders.map((o) => (
              <div
                key={o.id}
                onClick={() => {
                  const next = o.id === selectedId ? null : o.id;
                  setSelectedId(next);
                  if (!next) setSelectedItems([]);
                }}
                className="qaaq-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: ORDER_GRID_COLS, /* #15/#16 */
                  gap: 14,
                  padding: "12px 18px",
                  borderBottom: "1px solid #F0EBE3",
                  alignItems: "center",
                  cursor: "pointer",
                  background: o.id === selectedId ? "#FBF9F5" : undefined,
                }}
              >
                {/* Dot indicator */}
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: STATUS_DOT_COLORS[o.status] || "#9A9086",
                    flexShrink: 0,
                  }}
                />

                {/* #17 — Ref */}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1512" }}>
                  {o.ref}
                </span>

                {/* #18 — Customer */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#1A1512",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {o.customer_name}
                  </div>
                  <div style={{ fontSize: 11, color: "#9A9086", marginTop: 2 }}>
                    {o.city || "\u2014"} &middot;{" "}
                    {new Date(o.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>

                {/* #55 — Items column */}
                <span style={{ fontSize: 12, color: "#7C7268" }}>
                  {o.item_count} {o.item_count === 1 ? "item" : "items"}
                </span>

                {/* #19 — Total */}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1512" }}>
                  PKR {o.total.toLocaleString()}
                </span>

                {/* #20 — Status badge */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "3px 7px",
                    color: STATUS_STYLES[o.status]?.color || "#1A1512",
                    background: STATUS_STYLES[o.status]?.bg || "#EDE7DC",
                    justifySelf: "start",
                  }}
                >
                  {o.status}
                </span>
              </div>
            ))}

            {/* #21/#22/#23 — Footer with pagination */}
            <div
              style={{
                padding: "13px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, color: "#7C7268" }}>
                {showFrom} &ndash; {showTo} of {filtered.length}
              </span>
              {/* #54 — pagination with next arrow */}
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      width: 28,
                      height: 28,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      borderRadius: 2,
                      cursor: "pointer",
                      border:
                        currentPage === p ? "1px solid #1A1512" : "1px solid #DCD3C5",
                      background: currentPage === p ? "#1A1512" : "#fff",
                      color: currentPage === p ? "#fff" : "#4A4139",
                    }}
                  >
                    {p}
                  </button>
                ))}
                {totalPages > 1 && currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      borderRadius: 2,
                      cursor: "pointer",
                      border: "1px solid #DCD3C5",
                      background: "#fff",
                      color: "#4A4139",
                    }}
                  >
                    &#8250;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* #24 — Right: Detail panel */}
          {selected && (
            <div
              style={{
                border: "1px solid #E7E1D7",
                background: "#fff",
                position: "sticky",
                top: 116,
              }}
            >
              {/* #25/#26/#27/#28 — Panel header */}
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid #E7E1D7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 650, color: "#1A1512" }}>
                    #{selected.ref}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9A9086", marginTop: 2 }}>
                    {new Date(selected.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(selected.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    &middot; {selected.channel}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "4px 8px",
                    color: STATUS_STYLES[selected.status]?.color || "#1A1512",
                    background: STATUS_STYLES[selected.status]?.bg || "#EDE7DC",
                  }}
                >
                  {selected.status}
                </span>
              </div>

              {/* #29/#30/#31/#32 — CUSTOMER section */}
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #F0EBE3" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#9A9086",
                  }}
                >
                  Customer
                </div>
                <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 600, color: "#1A1512" }}>
                  {selected.customer_name}
                </div>
                <div style={{ fontSize: 12.5, color: "#7C7268", marginTop: 3 }}>
                  {selected.customer_phone || "No phone"} &middot; {selected.city || "No city"}
                </div>
                {selected.customer_email && (
                  <div style={{ fontSize: 12.5, color: "#7C7268", marginTop: 2 }}>
                    {selected.customer_email}
                  </div>
                )}
                {/* #33 — WhatsApp button */}
                {selected.customer_phone && (
                  <a
                    href={`https://wa.me/${selected.customer_phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      height: 34,
                      padding: "0 12px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#fff",
                      background: "#1FA855",
                      border: "none",
                      borderRadius: 2,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    <ExternalLink style={{ width: 12, height: 12 }} />
                    Open thread
                  </a>
                )}
              </div>

              {/* #34/#35/#36/#37 — ITEMS section */}
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #F0EBE3" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#9A9086",
                  }}
                >
                  Items
                </div>
                {selectedItems.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      marginTop: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {it.image_url ? (
                      <img
                        src={it.image_url}
                        alt=""
                        style={{
                          width: 34,
                          height: 34,
                          objectFit: "cover",
                          borderRadius: 2,
                          background: "#EDE7DC",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          background: "#EDE7DC",
                          border: "1px solid #E0D8CA",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#1A1512",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {it.product_name}
                      </div>
                      <div style={{ fontSize: 11, color: "#9A9086", marginTop: 1 }}>
                        {it.weight_label} &times; {it.quantity}
                      </div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1512", flexShrink: 0 }}>
                      PKR {it.line_total.toLocaleString()}
                    </span>
                  </div>
                ))}

                {/* #38/#59 — Subtotal / shipping / total */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #F0EBE3", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12.5,
                      color: "#7C7268",
                    }}
                  >
                    <span>Subtotal</span>
                    <span style={{ color: "#1A1512", fontWeight: 500 }}>PKR {selected.subtotal.toLocaleString()}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12.5,
                      color: "#7C7268",
                    }}
                  >
                    <span>Shipping</span>
                    <span style={{ color: "#1A1512", fontWeight: 500 }}>
                      {selected.delivery_fee > 0
                        ? `PKR ${selected.delivery_fee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "#1A1512",
                    }}
                  >
                    <span>Total</span>
                    <span>PKR {selected.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* #39/#40/#41/#42/#43/#44/#45/#46/#58 — TIMELINE section */}
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #F0EBE3" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#9A9086",
                    marginBottom: 12,
                  }}
                >
                  Timeline
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const state = getTimelineStatus(step.key, selected.status);
                    const isDone = state === "done";
                    const isActive = state === "active";
                    const isFuture = state === "future";
                    const isLast = idx === TIMELINE_STEPS.length - 1;

                    /* #45 — dot colors */
                    const dotColor = isDone
                      ? "#4E7A3E"
                      : isActive
                        ? "#4E7A3E"
                        : "#DCD3C5";
                    /* #46 — ring colors via box-shadow */
                    const ringColor = idx === 0
                      ? "#E7E1D7"
                      : "#EFEAE2";
                    const textColor = isFuture ? "#C4BAB0" : "#1A1512";
                    /* #58 — font weights: active=600, done=500, future=500 */
                    const textWeight = isActive ? 600 : isDone ? 500 : 500;

                    /* Only the first step has a real timestamp (created_at) \u2014
                       other steps have no recorded time, so show no date */
                    const whenText = isFuture
                      ? "\u2014"
                      : idx === 0
                        ? new Date(selected.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })
                        : null;

                    return (
                      <div key={step.key} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, paddingBottom: isLast ? 0 : 12 }}>
                        {/* #42 — simplified dot with box-shadow ring */}
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            marginTop: 4,
                            background: dotColor,
                            boxShadow: !isFuture ? `0 0 0 3px ${ringColor}` : "none",
                          }}
                        />
                        {/* Step text */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: textWeight,
                              color: textColor,
                              lineHeight: 1.3,
                            }}
                          >
                            {step.label}
                          </div>
                          {whenText && (
                            <div
                              style={{
                                fontSize: 11,
                                color: isFuture ? "#D0C9C0" : "#9A9086",
                                marginTop: 1,
                              }}
                            >
                              {whenText}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* #47/#48/#49/#50 — Actions */}
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                {NEXT_STATUS[selected.status] && (
                  <button
                    onClick={() => updateStatus(selected.id, NEXT_STATUS[selected.status])}
                    style={{
                      width: "100%",
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      color: "#fff",
                      background: "#1A1512",
                      border: "1px solid #1A1512",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    {NEXT_ACTION_LABEL[selected.status]}
                  </button>
                )}
                {selected.status !== "cancelled" && selected.status !== "delivered" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => cancelOrder(selected.id)}
                      style={{
                        flex: 1,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12.5,
                        fontWeight: 500,
                        fontFamily: "inherit",
                        color: "#B4551F",
                        background: "#fff",
                        border: "1px solid #DCD3C5",
                        borderRadius: 2,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Notes — #51 flagged as extra but keeping as functional addition */}
              {selected.notes && (
                <div style={{ padding: "16px 18px", borderTop: "1px solid #F0EBE3" }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#9A9086",
                    }}
                  >
                    Notes
                  </div>
                  <p style={{ marginTop: 6, fontSize: 12.5, color: "#7C7268", lineHeight: 1.5 }}>
                    {selected.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
