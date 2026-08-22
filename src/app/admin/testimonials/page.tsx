"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import {
  getTestimonials,
  getTestimonialCounts,
  updateTestimonialStatusAction,
  deleteTestimonialAction,
} from "./actions";
import type { TestimonialCounts, TestimonialWithOrder } from "./actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/* ── design tokens ── */
const ink = "#1A1512";
const gold = "#C8922E";
const line = "#E7E1D7";
const muted = "#7C7268";
const muted2 = "#9A9086";
const body = "#4A4139";
const faint = "#B0A69A";
const warn = "#B4551F";
const warnBg = "#F7EBDA";
const bodyDark = "#2E2721";

type TabKey = "pending" | "approved" | "rejected";

const PAGE_SIZE = 20;

/* ── helpers ── */
function daysAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

function formatDeliveryDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialWithOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<TestimonialCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey>("pending");

  const fetchData = useCallback(async (tab: TabKey, pageNum: number) => {
    const [pageResult, countsResult] = await Promise.all([
      getTestimonials(tab, pageNum, PAGE_SIZE),
      getTestimonialCounts(),
    ]);
    // If the current page emptied out (e.g. last item deleted), step back
    if (pageResult.items.length === 0 && pageNum > 1 && pageResult.total > 0) {
      setPage(Math.max(1, Math.ceil(pageResult.total / PAGE_SIZE)));
      return;
    }
    setItems(pageResult.items);
    setTotal(pageResult.total);
    setCounts(countsResult);
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchData(selectedTab, page);
    };
    void load();
  }, [fetchData, selectedTab, page]);

  function selectTab(tab: TabKey) {
    if (tab === selectedTab) return;
    setSelectedTab(tab);
    setPage(1);
    setLoading(true);
  }

  function goToPage(pageNum: number) {
    setPage(pageNum);
    setLoading(true);
  }

  async function handleApprove(id: string, name: string) {
    setProcessingId(id);
    const ok = await updateTestimonialStatusAction(id, "approved");
    if (ok) {
      toast.success(`Review by ${name} approved`);
    } else {
      toast.error("Failed to approve review");
    }
    await fetchData(selectedTab, page);
    setProcessingId(null);
  }

  async function handleReject(id: string, name: string) {
    setProcessingId(id);
    const ok = await updateTestimonialStatusAction(id, "rejected");
    if (ok) {
      toast("Review by " + name + " rejected");
    } else {
      toast.error("Failed to reject review");
    }
    await fetchData(selectedTab, page);
    setProcessingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setProcessingId(id);
    const ok = await deleteTestimonialAction(id);
    if (ok) {
      toast("Review deleted");
    } else {
      toast.error("Failed to delete review");
    }
    await fetchData(selectedTab, page);
    setProcessingId(null);
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* Header row: title + subtext left, tabs right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 0,
          gap: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-.035em",
              color: ink,
              margin: 0,
            }}
          >
            Reviews
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: muted,
              margin: "6px 0 0",
              lineHeight: 1.5,
            }}
          >
            Nothing appears on the storefront until you approve it. Match the
            reviewer to an order before you do.
          </p>
        </div>

        {/* Pill / segment tabs */}
        <div
          style={{
            display: "flex",
            gap: 1,
            background: "#DCD3C5",
            border: "1px solid #DCD3C5",
            borderRadius: 2,
            flexShrink: 0,
          }}
        >
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <span
                key={tab.key}
                onClick={() => selectTab(tab.key)}
                style={{
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: isActive ? 650 : 500,
                  fontFamily: "inherit",
                  background: isActive ? ink : "#fff",
                  color: isActive ? "#fff" : body,
                  border: "none",
                  cursor: "pointer",
                  transition: "background .15s, color .15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  lineHeight: 1,
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: 11,
                    opacity: isActive ? 0.65 : 0.7,
                  }}
                >
                  {tab.count}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Card grid */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{ width: 22, height: 22, color: faint }}
          />
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: muted,
            fontSize: 14,
          }}
        >
          No {selectedTab} reviews
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              marginTop: 22,
            }}
          >
            {items.map((t) => (
              <ReviewCard
                key={t.id}
                testimonial={t}
                processing={processingId === t.id}
                onApprove={() => handleApprove(t.id, t.name)}
                onReject={() => handleReject(t.id, t.name)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <span style={{ fontSize: 12.5, color: muted }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                style={{
                  height: 32,
                  padding: "0 14px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  background: "#fff",
                  color: page <= 1 ? faint : body,
                  border: "1px solid #DCD3C5",
                  borderRadius: 2,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  transition: "opacity .15s",
                }}
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                style={{
                  height: 32,
                  padding: "0 14px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  background: "#fff",
                  color: page >= totalPages ? faint : body,
                  border: "1px solid #DCD3C5",
                  borderRadius: 2,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  transition: "opacity .15s",
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Review card ── */

function ReviewCard({
  testimonial: t,
  processing,
  onApprove,
  onReject,
  onDelete,
}: {
  testimonial: TestimonialWithOrder;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const canVerify = t.matched_order !== null;

  // Build order match description
  let orderMatchText = "";
  if (canVerify) {
    const parts: string[] = [`Matched to order #${t.matched_order!.ref}`];
    if (t.matched_order!.items_summary) {
      parts.push(`\u2014 ${t.matched_order!.items_summary}`);
    }
    if (
      t.matched_order!.status === "delivered" ||
      t.matched_order!.status === "completed"
    ) {
      parts.push(`, delivered ${formatDeliveryDate(t.matched_order!.created_at)}`);
    }
    orderMatchText = parts.join("");
  }

  return (
    <div
      style={{
        border: `1px solid ${line}`,
        background: "#fff",
        padding: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Row 1: Name + City on left, Stars on right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontWeight: 650,
              fontSize: 13.5,
              color: ink,
            }}
          >
            {t.name}
          </span>
          {t.location && (
            <span style={{ fontSize: 11.5, color: muted2 }}>{t.location}</span>
          )}
        </div>

        {/* Stars */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexShrink: 0,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              style={{
                fill: i < t.rating ? gold : "transparent",
                stroke: i < t.rating ? "none" : line,
                strokeWidth: i < t.rating ? 0 : 1.5,
              }}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>
      </div>

      {/* Row 2: email + days ago */}
      <div style={{ fontSize: 11.5, color: faint, marginTop: 3 }}>
        {t.email}
        <span style={{ margin: "0 5px" }}>&middot;</span>
        {daysAgo(t.created_at)}
      </div>

      {/* Row 3: Review body - full text, no truncation */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: bodyDark,
          margin: "14px 0 0",
        }}
      >
        {t.content}
      </p>

      {/* Row 4: Order match row with left border */}
      <div
        style={{
          borderLeft: canVerify ? `2px solid ${gold}` : `2px solid ${warn}`,
          background: canVerify ? "#FBF9F5" : warnBg,
          padding: "10px 12px",
          fontSize: 12,
          marginTop: 14,
        }}
      >
        {canVerify ? (
          <span style={{ color: body }}>{orderMatchText}</span>
        ) : (
          <span style={{ color: warn, fontWeight: 550 }}>
            No matching order &mdash; cannot be marked verified
          </span>
        )}
      </div>

      {/* Row 5: Action buttons left, product link right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
        }}
      >
        {/* Approve button */}
        {(t.status === "pending" || t.status === "rejected") && (
          <button
            onClick={onApprove}
            disabled={processing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 16px",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              background: ink,
              color: "#fff",
              border: "none",
              borderRadius: 2,
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.5 : 1,
              transition: "opacity .15s",
            }}
          >
            {processing ? (
              <Loader2
                className="animate-spin"
                style={{ width: 14, height: 14 }}
              />
            ) : null}
            Approve
          </button>
        )}

        {/* Reject button - outlined */}
        {(t.status === "pending" || t.status === "approved") && (
          <button
            onClick={onReject}
            disabled={processing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 16px",
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: "inherit",
              background: "#fff",
              color: body,
              border: `1px solid #DCD3C5`,
              borderRadius: 2,
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.5 : 1,
              transition: "opacity .15s",
            }}
          >
            Reject
          </button>
        )}

        {/* Delete - quiet text button */}
        <button
          onClick={onDelete}
          disabled={processing}
          style={{
            height: 36,
            padding: "0 8px",
            fontSize: 12.5,
            fontWeight: 500,
            fontFamily: "inherit",
            background: "none",
            color: warn,
            border: "none",
            cursor: processing ? "not-allowed" : "pointer",
            opacity: processing ? 0.5 : 1,
            transition: "opacity .15s",
          }}
        >
          Delete
        </button>

        {/* Product name link on far right */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "#7C7268",
            cursor: "pointer",
          }}
        >
          {t.product_name || "No product selected"}
        </span>
      </div>
    </div>
  );
}
