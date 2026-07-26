"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Testimonial } from "@/types";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  // Duplicate for seamless marquee
  const items = [...testimonials, ...testimonials];

  return (
    <section style={{ padding: "96px 0 0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px" }}>
        <div
          className="flex items-end justify-between gap-6"
          style={{ paddingBottom: "20px", borderBottom: "1px solid #1A1512" }}
        >
          <div>
            <div className="qaaq-eyebrow">05 — Reviews</div>
            <h2
              style={{
                margin: "14px 0 0",
                fontSize: "clamp(34px, 4vw, 54px)",
                lineHeight: 1,
                letterSpacing: "-.04em",
                fontWeight: 800,
              }}
            >
              Loved by customers
            </h2>
          </div>
          <Link
            href="/feedback"
            className="shrink-0"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              borderBottom: "1px solid #C8922E",
              paddingBottom: "2px",
              marginBottom: "6px",
            }}
          >
            Leave a review
          </Link>
        </div>
      </div>

      {/* Marquee */}
      <div className="mt-8 flex whitespace-nowrap overflow-hidden">
        <div
          className="inline-flex gap-4 pl-4"
          style={{
            animation: "qaaq-marquee 52s linear infinite",
            willChange: "transform",
          }}
        >
          {items.map((r, i) => (
            <div
              key={`${r.id}-${i}`}
              className="whitespace-normal"
              style={{
                flex: "0 0 372px",
                background: "#fff",
                border: "1px solid #E7E1D7",
                padding: "26px 26px 22px",
                borderRadius: "3px",
              }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star
                    key={j}
                    style={{
                      width: "13px",
                      height: "13px",
                      fill: "#C8922E",
                      stroke: "none",
                    }}
                  />
                ))}
              </div>

              {/* Review text */}
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "#2E2721",
                }}
              >
                {r.content}
              </p>

              {/* Author */}
              <div
                className="flex items-center justify-between"
                style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #F0EBE3",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: "11.5px", color: "#7C7268", marginTop: "2px" }}>
                    {r.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
