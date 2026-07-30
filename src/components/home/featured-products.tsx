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
            style={{ flex: "0 0 296px" }}
          >
            <div
              className="qaaq-ovwrap"
              style={{
                background: "#FBF9F5",
                padding: "18px 18px 20px",
                position: "relative",
                height: "100%",
              }}
            >
            <Link
              href={`/products/${p.slug}`}
              className="block qaaq-hover-lift"
              style={{
                height: "100%",
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

                {/* Hover overlay */}
                <div
                  className="qaaq-ov absolute inset-0 flex items-end justify-center"
                  style={{ padding: 10, gap: 6 }}
                >
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    style={{
                      flex: 1,
                      height: 38,
                      background: "#1A1512",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open("https://wa.me/923001234567", "_blank"); }}
                    className="flex items-center justify-center"
                    style={{
                      width: 38,
                      height: 38,
                      background: "#1FA855",
                      flexShrink: 0,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </button>
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
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
