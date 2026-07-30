"use client";

import { useState } from "react";
import Link from "next/link";

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

const FILTERS = ["All", "Processing", "Shipped", "Delivered"] as const;

export default function OrderHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

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
          </button>
        ))}
      </div>

      {/* Empty state */}
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
    </div>
  );
}
