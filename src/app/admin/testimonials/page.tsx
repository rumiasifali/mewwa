"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import {
  getTestimonials,
  updateTestimonialStatusAction,
  deleteTestimonialAction,
} from "./actions";
import type { TestimonialWithOrder } from "./actions";
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
  const [testimonials, setTestimonials] = useState<TestimonialWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey>("pending");

  const fetchData = useCallback(async () => {
    const data = await getTestimonials();
    setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    void load();
  }, [fetchData]);

  async function handleApprove(id: string, name: string) {
    setProcessingId(id);
    const ok = await updateTestimonialStatusAction(id, "approved");
    if (ok) {
      toast.success(`Review by ${name} approved`);
    } else {
      toast.error("Failed to approve review");
    }
    await fetchData();
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
    await fetchData();
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
    await fetchData();
    setProcessingId(null);
  }

  const pending = testimonials.filter((t) => t.status === "pending");
  const approved = testimonials.filter((t) => t.status === "approved");
  const rejected = testimonials.filter((t) => t.status === "rejected");

  const tabData: Record<TabKey, TestimonialWithOrder[]> = {
    pending,
    approved,
    rejected,
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pending.length },
    { key: "approved", label: "Approved", count: approved.length },
    { key: "rejected", label: "Rejected", count: rejected.length },
  ];

  const currentList = tabData[selectedTab];

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
                onClick={() => setSelectedTab(tab.key)}
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
      ) : currentList.length === 0 ? (
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginTop: 22,
          }}
        >
          {currentList.map((t) => (
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
