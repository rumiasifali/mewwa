"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "@/components/shared/motion";
import type { Category } from "@/types";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  // Build the bento: first category spans 2 rows, rest fill the grid
  const main = categories[0];
  const rest = categories.slice(1, 4);

  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "96px 28px 0" }}>
      {/* Header */}
      <div
        className="flex items-end justify-between gap-6"
        style={{ paddingBottom: "20px", borderBottom: "1px solid #1A1512" }}
      >
        <div>
          <div className="qaaq-eyebrow">02 — Shop by kind</div>
          <h2
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(34px, 4vw, 54px)",
              lineHeight: 1,
              letterSpacing: "-.04em",
              fontWeight: 800,
            }}
          >
            Four aisles, no filler
          </h2>
        </div>
      </div>

      {/* Bento grid — 1px seam background */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr_1fr] lg:grid-rows-[246px_246px]"
        style={{
          gap: "1px",
          background: "#E7E1D7",
          borderTop: "1px solid #E7E1D7",
        }}
      >
        {/* Main category — spans 2 rows */}
        {main && (
          <Link
            href={`/products?category=${main.slug}`}
            className="qaaq-zoom relative overflow-hidden lg:row-span-2"
            style={{ background: "#F0EBE3" }}
          >
            {main.image_url ? (
              <Image
                src={main.image_url}
                alt={main.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(to top, rgba(15,12,10,.86), rgba(15,12,10,.15) 55%, transparent)",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ left: "26px", right: "26px", bottom: "24px" }}
            >
              <div
                style={{
                  fontSize: "10.5px",
                  letterSpacing: ".24em",
                  textTransform: "uppercase",
                  color: "#E7C079",
                  fontWeight: 700,
                }}
              >
                {main.description || "Browse"}
              </div>
              <h3
                style={{
                  margin: "8px 0 0",
                  fontSize: "38px",
                  fontWeight: 800,
                  letterSpacing: "-.04em",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {main.name}
              </h3>
            </div>
          </Link>
        )}

        {/* Remaining categories */}
        {rest.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="qaaq-zoom relative overflow-hidden"
            style={{ background: "#F0EBE3" }}
          >
            {cat.image_url ? (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(to top, rgba(15,12,10,.84), rgba(15,12,10,.1) 60%, transparent)",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ left: "20px", right: "20px", bottom: "18px" }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "#E7C079",
                  fontWeight: 700,
                }}
              >
                {cat.description || "Browse"}
              </div>
              <h3
                style={{
                  margin: "6px 0 0",
                  fontSize: "24px",
                  fontWeight: 750,
                  letterSpacing: "-.03em",
                  color: "#fff",
                  lineHeight: 1.05,
                }}
              >
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}

        {/* "Build a box" dark tile */}
        <div
          className="flex flex-col justify-between"
          style={{
            background: "#1A1512",
            padding: "26px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#C8922E",
                fontWeight: 700,
              }}
            >
              Not sure?
            </div>
            <h3
              style={{
                margin: "10px 0 0",
                fontSize: "23px",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "#fff",
                lineHeight: 1.15,
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
              }}
            >
              Tell us the occasion and we&apos;ll build the box.
            </h3>
          </div>
          <Link
            href="/contact"
            className="qaaq-press inline-flex items-center justify-between"
            style={{
              height: "44px",
              padding: "0 16px",
              background: "#EDE7DC",
              color: "#1A1512",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "2px",
            }}
          >
            Build a box
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A1512"
              strokeWidth="2"
            >
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
