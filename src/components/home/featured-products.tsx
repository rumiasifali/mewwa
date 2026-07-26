"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "@/components/shared/motion";
import { ArrowLeft, ArrowRight, MapPin, Star } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scroll(dir: "left" | "right") {
    if (!railRef.current) return;
    const amount = 312;
    railRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "96px 28px 0" }}>
      {/* Header */}
      <div
        className="flex items-end justify-between gap-6"
        style={{ paddingBottom: "20px", borderBottom: "1px solid #1A1512" }}
      >
        <div>
          <div className="qaaq-eyebrow">01 — The shelf</div>
          <h2
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(34px, 4vw, 54px)",
              lineHeight: 1,
              letterSpacing: "-.04em",
              fontWeight: 800,
            }}
          >
            What&apos;s moving this week
          </h2>
        </div>
        <div className="flex items-center gap-[10px] shrink-0 pb-[6px]">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center"
            style={{
              width: "38px",
              height: "38px",
              border: "1px solid #DCD3C5",
              borderRadius: "2px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <ArrowLeft style={{ width: "15px", height: "15px" }} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center"
            style={{
              width: "38px",
              height: "38px",
              border: "1px solid #DCD3C5",
              borderRadius: "2px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <ArrowRight style={{ width: "15px", height: "15px" }} />
          </button>
          <Link
            href="/products"
            className="ml-2"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              borderBottom: "1px solid #C8922E",
              paddingBottom: "2px",
            }}
          >
            All {products.length} products
          </Link>
        </div>
      </div>

      {/* Horizontal rail with 1px seam grid */}
      <div
        ref={railRef}
        className="qaaq-scroll flex overflow-x-auto"
        style={{
          gap: "1px",
          background: "#E7E1D7",
          scrollBehavior: "smooth",
          paddingTop: "1px",
        }}
      >
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.08,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={`/products/${p.slug}`}
              className="block qaaq-hover-lift"
              style={{
                flex: "0 0 296px",
                background: "#FBF9F5",
                padding: "18px 18px 20px",
                position: "relative",
              }}
            >
              {/* Image */}
              <div
                className="qaaq-zoom relative overflow-hidden"
                style={{ aspectRatio: "1", background: "#F0EBE3" }}
              >
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="296px"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "#EDE7DC", border: "1px solid #E0D8CA" }}
                  />
                )}

                {/* Badges */}
                <div className="absolute top-[10px] left-[10px] flex flex-col gap-[5px] pointer-events-none">
                  {p.tags.includes("bestseller") && (
                    <span
                      style={{
                        background: "#1A1512",
                        color: "#fff",
                        fontSize: "9.5px",
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        padding: "4px 8px",
                      }}
                    >
                      Bestseller
                    </span>
                  )}
                  {p.tags.includes("rare") && (
                    <span
                      style={{
                        background: "#C8922E",
                        color: "#1A1512",
                        fontSize: "9.5px",
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        padding: "4px 8px",
                      }}
                    >
                      Rare
                    </span>
                  )}
                </div>
              </div>

              {/* Origin */}
              {p.origin && (
                <div className="flex items-center gap-[6px] mt-[14px]">
                  <MapPin
                    className="text-[#C8922E]"
                    style={{ width: "11px", height: "11px", strokeWidth: 2.4 }}
                  />
                  <span
                    style={{
                      fontSize: "10.5px",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "#7C7268",
                      fontWeight: 600,
                    }}
                  >
                    {p.origin}
                  </span>
                </div>
              )}

              {/* Name */}
              <h3
                style={{
                  margin: "7px 0 0",
                  fontSize: "19px",
                  fontWeight: 650,
                  letterSpacing: "-.025em",
                }}
              >
                {p.name}
              </h3>

              {/* Price + rating */}
              <div
                className="flex items-baseline justify-between"
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid #E7E1D7",
                }}
              >
                <div>
                  <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-.02em" }}>
                    {p.weights[0] ? formatPrice(p.weights[0].price) : "—"}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "#7C7268", marginLeft: "3px" }}>
                    / {p.weights[0]?.label || "—"}
                  </span>
                </div>
                <span className="flex items-center gap-1" style={{ fontSize: "11.5px", color: "#4A4139", fontWeight: 500 }}>
                  <Star style={{ width: "11px", height: "11px", fill: "#C8922E", stroke: "none" }} />
                  4.8
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
