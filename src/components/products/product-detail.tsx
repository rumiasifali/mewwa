"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Shield, Plus } from "lucide-react";
import { formatPrice, getWhatsAppLink } from "@/lib/constants";
import { motion, AnimatedSection } from "@/components/shared/motion";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import type { Product } from "@/types";

/* ───── mock data for sections not yet in the DB ───── */

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Hamza K.",
    city: "Islamabad",
    rating: 5,
    text: "Best almonds I have ever tasted. You can really tell the difference from the store-bought stuff. Will order again.",
  },
  {
    id: 2,
    name: "Ayesha R.",
    city: "Lahore",
    rating: 5,
    text: "The packaging was beautiful and the quality was outstanding. Sent these as a gift and got so many compliments.",
  },
  {
    id: 3,
    name: "Omar S.",
    city: "Karachi",
    rating: 4,
    text: "Fresh, crunchy and flavourful. Delivery was quick too. Only giving 4 stars because I wanted a bigger bag option.",
  },
  {
    id: 4,
    name: "Fatima A.",
    city: "Peshawar",
    rating: 5,
    text: "The cashews were perfectly roasted. My family finished the whole pack in two days. Ordering the 1 kg bag next.",
  },
];

const RATING_DISTRIBUTION = [68, 20, 8, 3, 1]; // 5★ → 1★ percentages

const STORAGE_TIPS = [
  "Store in a cool, dry place away from direct sunlight and strong odours.",
  "Once opened, transfer to an airtight container or reseal the vacuum pouch tightly.",
  "For maximum freshness, refrigerate after opening — keeps well for up to 6 months.",
  "Avoid storing near heat sources such as stoves or ovens.",
];

const ASSURANCE_ITEMS = [
  { text: "Single-origin, lab report available", meta: "View report" },
  { text: "Packed to order — not off a shelf", meta: "Same-day dispatch" },
  { text: "Free shipping over PKR 5,000", meta: "All Pakistan" },
  { text: "Vacuum sealed, nitrogen flushed", meta: "Max freshness" },
];

/* ───── inline WhatsApp SVG ───── */

function WhatsAppIcon({ size = 20, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        fill="currentColor"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.963 7.963 0 01-4.1-1.132L4 20l1.132-3.9A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ───── component ───── */

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "nutrition" | "origin" | "storage" | "shipping"
  >("nutrition");
  const [selectedWeight, setSelectedWeight] = useState(0);

  const currentWeight = product.weights[selectedWeight];

  // Build image list: main image + product.images
  const allImages: string[] = [
    product.image_url,
    ...(product.images || []),
  ].filter(Boolean);

  const displayedImage = allImages[selectedImage] || product.image_url;

  const perKgPrice =
    currentWeight && currentWeight.grams > 0
      ? ((currentWeight.price / currentWeight.grams) * 1000).toFixed(0)
      : null;

  const categoryLabel =
    product.category
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Products";

  const tabs = ["Nutrition", "Origin", "Storage", "Shipping"] as const;
  const tabKeys = ["nutrition", "origin", "storage", "shipping"] as const;

  return (
    <div style={{ paddingTop: 100 }}>
      {/* ══════════ Breadcrumb ══════════ */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "26px 28px 0",
          fontSize: 11.5,
          color: "#7C7268",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Link href="/" style={{ color: "#7C7268", textDecoration: "none" }}>
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          style={{ color: "#7C7268", textDecoration: "none" }}
        >
          {categoryLabel}
        </Link>
        <span>/</span>
        <span style={{ color: "#4A4139", fontWeight: 500 }}>{product.name}</span>
      </motion.nav>

      {/* ══════════ Two-Column Grid ══════════ */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "22px 28px 0",
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 52,
          alignItems: "start",
        }}
        className="qaaq-pdp-grid"
      >
        {/* ─────── LEFT COLUMN ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Image */}
          <div
            style={{
              position: "relative",
              aspectRatio: "1",
              overflow: "hidden",
              background: "#F0EBE3",
            }}
          >
            {displayedImage && (
              <Image
                src={displayedImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
              />
            )}

            {/* Badges */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                flexDirection: "row",
                gap: 6,
              }}
            >
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "#1A1512",
                    color: "#fff",
                    fontSize: 10,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    padding: "5px 9px",
                    display: "inline-block",
                  }}
                >
                  {tag}
                </span>
              ))}
              {product.nutrition?.serving_size && (
                <span
                  style={{
                    background: "rgba(251,249,245,.94)",
                    color: "#4A4139",
                    fontSize: 10,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    padding: "5px 9px",
                    display: "inline-block",
                  }}
                >
                  Premium Grade
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Grid */}
          {allImages.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                marginTop: 8,
              }}
            >
              {allImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    aspectRatio: "1",
                    overflow: "hidden",
                    background: "#F0EBE3",
                    position: "relative",
                    cursor: "pointer",
                    border:
                      i === selectedImage
                        ? "2px solid #1A1512"
                        : "1px solid #E7E1D7",
                    padding: 0,
                  }}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* ─── Info Tabs ─── */}
          <div style={{ marginTop: 40, borderTop: "1px solid #1A1512" }}>
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #E7E1D7",
              }}
            >
              {tabs.map((label, i) => {
                const key = tabKeys[i];
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: "16px 20px",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#1A1512" : "#7C7268",
                      marginBottom: -1,
                      background: "none",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottomWidth: 2,
                      borderBottomStyle: "solid",
                      borderBottomColor: isActive ? "#1A1512" : "transparent",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div style={{ padding: "28px 0 0" }}>
              {/* ── Nutrition ── */}
              {activeTab === "nutrition" && (
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#7C7268",
                      marginBottom: 20,
                    }}
                  >
                    Per {product.nutrition?.serving_size || "30g"} serving
                    &middot; values from our most recent lab report
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1,
                      background: "#E7E1D7",
                      border: "1px solid #E7E1D7",
                    }}
                  >
                    {[
                      {
                        value: `${product.nutrition?.calories || 0}`,
                        label: "Calories",
                      },
                      {
                        value: product.nutrition?.protein || "—",
                        label: "Protein",
                      },
                      { value: product.nutrition?.fat || "—", label: "Fat" },
                      {
                        value: product.nutrition?.carbs || "—",
                        label: "Carbs",
                      },
                      {
                        value: product.nutrition?.fiber || "—",
                        label: "Fiber",
                      },
                      {
                        value:
                          product.nutrition?.serving_size || "30g",
                        label: "Serving Size",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: "#FBF9F5",
                          padding: "18px 18px 20px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            letterSpacing: "-.03em",
                            color: "#1A1512",
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            letterSpacing: ".16em",
                            textTransform: "uppercase",
                            color: "#7C7268",
                            fontWeight: 600,
                            marginTop: 6,
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lab-tested info bar */}
                  <div
                    style={{
                      marginTop: 16,
                      background: "#F5F1EA",
                      borderLeft: "2px solid #6E7F4E",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Shield
                      size={15}
                      style={{ color: "#6E7F4E", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: "#3A332C",
                        lineHeight: 1.5,
                      }}
                    >
                      Aflatoxin and moisture tested — batch report available on request.
                    </span>
                  </div>
                </div>
              )}

              {/* ── Origin ── */}
              {activeTab === "origin" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: 24,
                  }}
                  className="qaaq-origin-grid"
                >
                  <div
                    style={{
                      aspectRatio: "1",
                      background: "#F0EBE3",
                      borderRadius: 2,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={`${product.origin} origin`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    )}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 650,
                        color: "#1A1512",
                        letterSpacing: "-.025em",
                        margin: 0,
                      }}
                    >
                      {product.origin}
                    </h3>
                    <p
                      style={{
                        fontSize: 14.5,
                        lineHeight: 1.7,
                        color: "#4A4139",
                        margin: "12px 0 0",
                      }}
                    >
                      Sourced directly from trusted farmers in{" "}
                      {product.origin}. Each batch is hand-selected and
                      quality-checked before it reaches you.
                    </p>
                    <div style={{ marginTop: 20 }}>
                    {[
                      { label: "Region", value: product.origin },
                      { label: "Altitude", value: "1,200 – 2,400m" },
                      { label: "Harvest", value: "September – November" },
                      { label: "Grade", value: "Premium A" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #E7E1D7",
                          padding: "11px 0",
                          fontSize: 13.5,
                        }}
                      >
                        <span style={{ color: "#7C7268" }}>{row.label}</span>
                        <span
                          style={{ color: "#1A1512", fontWeight: 600 }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Storage ── */}
              {activeTab === "storage" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    maxWidth: 620,
                  }}
                >
                  {STORAGE_TIPS.map((tip, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 14, alignItems: "start" }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "1px solid #DCD3C5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: "#4A4139",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.65,
                          color: "#4A4139",
                          margin: 0,
                        }}
                      >
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Shipping ── */}
              {activeTab === "shipping" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                    background: "#E7E1D7",
                    border: "1px solid #E7E1D7",
                  }}
                  className="qaaq-shipping-grid"
                >
                  {[
                    {
                      eyebrow: "Pakistan",
                      title: "Domestic Shipping",
                      body: "Free shipping on orders above PKR 5,000. Standard delivery via TCS and Leopards courier with real-time tracking.",
                      eta: "3 – 5 business days",
                    },
                    {
                      eyebrow: "Worldwide",
                      title: "International Shipping",
                      body: "Available to UAE, UK, US, Canada, and more. All international orders are customs-cleared and fully insured.",
                      eta: "7 – 14 business days",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      style={{
                        background: "#FBF9F5",
                        padding: 22,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          letterSpacing: ".18em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          color: "#C8922E",
                        }}
                      >
                        {card.eyebrow}
                      </span>
                      <h4
                        style={{
                          fontSize: 17,
                          fontWeight: 650,
                          color: "#1A1512",
                          margin: "12px 0 0",
                        }}
                      >
                        {card.title}
                      </h4>
                      <p
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.65,
                          color: "#7C7268",
                          margin: "8px 0 0",
                        }}
                      >
                        {card.body}
                      </p>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          marginTop: 14,
                          display: "block",
                        }}
                      >
                        {card.eta}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─────── RIGHT COLUMN ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "sticky",
            top: 118,
          }}
        >
          {/* Origin badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <MapPin size={12} style={{ color: "#C8922E" }} />
            <span
              style={{
                fontSize: 10.5,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "#7C7268",
                fontWeight: 600,
              }}
            >
              {product.origin}
            </span>
          </div>

          {/* Product name */}
          <h1
            style={{
              fontSize: "clamp(30px, 3.4vw, 44px)",
              lineHeight: 1.02,
              letterSpacing: "-.04em",
              fontWeight: 800,
              color: "#1A1512",
              margin: "12px 0 0",
            }}
          >
            {product.name}
          </h1>

          {/* Rating row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
            }}
          >
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={13}
                  fill="#C8922E"
                  stroke="#C8922E"
                  strokeWidth={0}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#4A4139" }}>
              <strong>4.8</strong> &middot; 24 verified reviews
            </span>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.7,
              color: "#4A4139",
              marginTop: 20,
              marginBottom: 0,
            }}
          >
            {product.description}
          </p>

          {/* Weight selector */}
          {product.weights.length > 0 && (
            <div
              style={{
                marginTop: 26,
                paddingTop: 22,
                borderTop: "1px solid #E7E1D7",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#1A1512",
                  }}
                >
                  Choose weight
                </span>
                <span style={{ fontSize: 11.5, color: "#7C7268" }}>
                  Price per kg shown
                </span>
              </div>

              {/* Weight cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {product.weights.map((w, i) => {
                  const isSelected = i === selectedWeight;
                  const pkgPrice = (
                    (w.price / w.grams) *
                    1000
                  ).toFixed(0);
                  const isBestValue =
                    product.weights.length > 1 &&
                    i === product.weights.length - 1;

                  return (
                    <button
                      key={w.grams}
                      onClick={() => setSelectedWeight(i)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 16px",
                        border: isSelected
                          ? "1.5px solid #1A1512"
                          : "1.5px solid #E7E1D7",
                        borderRadius: 2,
                        background: isSelected ? "#FBF9F5" : "#fff",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                        }}
                      >
                        {/* Radio dot */}
                        <span
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: "50%",
                            border: "1.5px solid",
                            borderColor: isSelected ? "#1A1512" : "#DCD3C5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#1A1512",
                              }}
                            />
                          )}
                        </span>
                        <span
                          style={{
                            fontSize: 14.5,
                            fontWeight: 600,
                            color: "#1A1512",
                          }}
                        >
                          {w.label}
                        </span>
                        {isBestValue && (
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              letterSpacing: ".13em",
                              textTransform: "uppercase",
                              color: "#6E7F4E",
                              border: "1px solid #C3CBAE",
                              padding: "2px 6px",
                            }}
                          >
                            Best value
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#1A1512",
                          }}
                        >
                          {formatPrice(w.price)}
                        </div>
                        <div style={{ fontSize: 11, color: "#7C7268", marginTop: 2 }}>
                          {formatPrice(Number(pkgPrice))}/kg
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order buttons */}
          <ProductOrderButtons product={product} currentWeight={currentWeight} />

          {/* Assurance list */}
          <div
            style={{
              marginTop: 24,
              border: "1px solid #E7E1D7",
              background: "#fff",
            }}
          >
            {ASSURANCE_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "13px 16px",
                  borderBottom:
                    i < ASSURANCE_ITEMS.length - 1
                      ? "1px solid #F0EBE3"
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#C8922E",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: "#3A332C" }}>
                  {item.text}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "#9A9086",
                    marginLeft: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.meta}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══════════ Reviews Section ══════════ */}
      <AnimatedSection>
        <section
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "88px 28px 0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 52,
              borderTop: "1px solid #1A1512",
              paddingTop: 32,
            }}
            className="qaaq-review-grid"
          >
            {/* Left — summary */}
            <div>
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#1A1512",
                  letterSpacing: "-.04em",
                  margin: 0,
                }}
              >
                Reviews
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <span
                  style={{
                    fontSize: 52,
                    fontWeight: 800,
                    color: "#1A1512",
                    letterSpacing: "-.04em",
                    lineHeight: 1,
                  }}
                >
                  4.8
                </span>
                <span style={{ fontSize: 14, color: "#7C7268" }}>
                  / 5 &middot; 24 reviews
                </span>
              </div>

              {/* Rating bars */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {RATING_DISTRIBUTION.map((pct, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#7C7268",
                        width: 10,
                      }}
                    >
                      {5 - i}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        background: "#E7E1D7",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: "#1A1512",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#B0A69A",
                        width: 26,
                        textAlign: "right",
                      }}
                    >
                      {Math.round((pct / 100) * 24)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 42,
                  padding: "0 20px",
                  border: "1px solid #1A1512",
                  borderRadius: 2,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1A1512",
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Write a review
              </button>
            </div>

            {/* Right — review cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                background: "#E7E1D7",
                border: "1px solid #E7E1D7",
              }}
              className="qaaq-review-cards-grid"
            >
              {MOCK_REVIEWS.map((review) => (
                <div
                  key={review.id}
                  style={{
                    background: "#FBF9F5",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        fill={n <= review.rating ? "#C8922E" : "#E7E1D7"}
                        stroke={n <= review.rating ? "#C8922E" : "#E7E1D7"}
                        strokeWidth={0}
                      />
                    ))}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: "#6E7F4E",
                      }}
                    >
                      Verified order
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: "#2E2721",
                      margin: "14px 0 0",
                    }}
                  >
                    {review.text}
                  </p>
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1A1512" }}>
                      {review.name}{" "}
                      <span style={{ color: "#9A9086", fontWeight: 400 }}>
                        &middot; {review.city}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ══════════ Related Products ══════════ */}
      {related.length > 0 && (
        <AnimatedSection>
          <section
            style={{
              maxWidth: 1400,
              margin: "0 auto",
              padding: "88px 28px 110px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                paddingBottom: 18,
                borderBottom: "1px solid #1A1512",
              }}
            >
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#1A1512",
                  letterSpacing: "-.03em",
                  margin: 0,
                }}
              >
                Pairs well with
              </h2>
              <Link
                href="/products"
                style={{
                  fontSize: 13,
                  color: "#1A1512",
                  textDecoration: "none",
                  fontWeight: 600,
                  borderBottom: "1px solid #C8922E",
                  paddingBottom: 2,
                }}
              >
                All products
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1,
                background: "#E7E1D7",
                borderTop: "1px solid #E7E1D7",
              }}
              className="qaaq-related-grid"
            >
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  style={{
                    background: "#FBF9F5",
                    padding: "14px 14px 16px",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      overflow: "hidden",
                      background: "#F0EBE3",
                    }}
                  >
                    {p.image_url && (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "#7C7268",
                      fontWeight: 600,
                      marginTop: 12,
                    }}
                  >
                    {p.origin}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 650,
                      color: "#1A1512",
                      letterSpacing: "-.02em",
                      margin: "6px 0 0",
                    }}
                  >
                    {p.name}
                  </div>
                  {p.weights.length > 0 && (
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: "#1A1512",
                        marginTop: 10,
                      }}
                    >
                      {formatPrice(p.weights[0].price)}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "#7C7268",
                          marginLeft: 3,
                        }}
                      >
                        / {p.weights[0].label}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ══════════ Responsive Styles ══════════ */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 900px) {
              .qaaq-pdp-grid {
                grid-template-columns: 1fr !important;
                gap: 36px !important;
              }
              .qaaq-review-grid {
                grid-template-columns: 1fr !important;
                gap: 32px !important;
              }
              .qaaq-review-cards-grid {
                grid-template-columns: 1fr !important;
              }
              .qaaq-related-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
              .qaaq-origin-grid {
                grid-template-columns: 1fr !important;
              }
              .qaaq-shipping-grid {
                grid-template-columns: 1fr !important;
              }
            }
            @media (max-width: 480px) {
              .qaaq-related-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}

/* ── Add to Cart + WhatsApp buttons ── */
function ProductOrderButtons({
  product,
  currentWeight,
}: {
  product: Product;
  currentWeight: Product["weights"][0] | undefined;
}) {
  const { user, openAuthModal } = useAuth();
  const { addItem, openCart } = useCart();

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!currentWeight) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.image_url,
      origin: product.origin,
      weightGrams: currentWeight.grams,
      weightLabel: currentWeight.label,
      price: currentWeight.price,
      currency: currentWeight.currency || "PKR",
    });

    toast("Added to your order", {
      description: `${product.name} — ${currentWeight.label}`,
      action: {
        label: "View cart",
        onClick: () => openCart(),
      },
      duration: 3000,
    });
  };

  return (
    <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 9 }}>
      {/* Primary: Add to Cart */}
      <button
        onClick={handleAddToCart}
        className="qaaq-press"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          height: 56,
          background: "#1A1512",
          color: "#fff",
          fontSize: 15.5,
          fontWeight: 600,
          borderRadius: 2,
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          width: "100%",
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
        Add to Cart &mdash;{" "}
        {currentWeight ? formatPrice(currentWeight.price) : ""}
      </button>

      {/* Secondary: WhatsApp */}
      <a
        href={getWhatsAppLink(product, currentWeight?.label)}
        target="_blank"
        rel="noopener noreferrer"
        className="qaaq-press"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          height: 52,
          border: "1px solid #1FA855",
          background: "#fff",
          color: "#128C4A",
          fontSize: 14.5,
          fontWeight: 600,
          borderRadius: 2,
          textDecoration: "none",
          width: "100%",
        }}
      >
        <WhatsAppIcon size={17} />
        Order {currentWeight?.label} &mdash;{" "}
        {currentWeight ? formatPrice(currentWeight.price) : ""}
      </a>

      {/* Tertiary buttons */}
      <div style={{ display: "flex", gap: 9 }}>
        <a
          href={getWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            height: 46,
            border: "1px solid #DCD3C5",
            fontSize: 13.5,
            fontWeight: 500,
            borderRadius: 2,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            textDecoration: "none",
            color: "#1A1512",
          }}
        >
          Ask a question
        </a>
        <a
          href={getWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            height: 46,
            border: "1px solid #DCD3C5",
            fontSize: 13.5,
            fontWeight: 500,
            borderRadius: 2,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            textDecoration: "none",
            color: "#1A1512",
          }}
        >
          Request bulk price
        </a>
      </div>

      <p
        style={{
          fontSize: 11.5,
          color: "#9A9086",
          textAlign: "center",
          marginTop: 4,
          marginBottom: 0,
        }}
      >
        Card checkout arrives in phase two. Today we confirm every order by
        message first.
      </p>
    </div>
  );
}
