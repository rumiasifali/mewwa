"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, getWhatsAppLink } from "@/lib/constants";
import type { Product } from "@/types";

export function CatalogCard({ product }: { product: Product }) {
  const firstWeight = product.weights[0];
  const grade = product.tags.find(
    (t) => t.toLowerCase() !== "bestseller" && t.toLowerCase() !== "rare"
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ display: "block", background: "#FBF9F5", padding: "14px 14px 16px" }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "1",
          overflow: "hidden",
          background: "#F0EBE3",
        }}
        className="qaaq-zoom"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#EDE7DC",
              border: "1px solid #E0D8CA",
            }}
          />
        )}

        {/* Badges — top left */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {product.tags.includes("bestseller") && (
            <span
              style={{
                background: "#1A1512",
                color: "#fff",
                fontSize: 9,
                letterSpacing: ".13em",
                textTransform: "uppercase",
                fontWeight: 700,
                padding: "3px 7px",
                lineHeight: 1.3,
              }}
            >
              Bestseller
            </span>
          )}
          {product.tags.includes("rare") && (
            <span
              style={{
                background: "#C8922E",
                color: "#1A1512",
                fontSize: 9,
                letterSpacing: ".13em",
                textTransform: "uppercase",
                fontWeight: 700,
                padding: "3px 7px",
                lineHeight: 1.3,
              }}
            >
              Rare
            </span>
          )}
        </div>

        {/* Grade pill — bottom right */}
        {grade && (
          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(251,249,245,.94)",
              fontSize: 9.5,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              fontWeight: 700,
              padding: "3px 7px",
              color: "#4A4139",
              lineHeight: 1.3,
            }}
          >
            {grade}
          </span>
        )}
      </div>

      {/* Origin */}
      {product.origin && (
        <p
          style={{
            fontSize: 10,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#7C7268",
            fontWeight: 600,
            marginTop: 12,
            lineHeight: 1.3,
          }}
        >
          {product.origin}
        </p>
      )}

      {/* Product name */}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 650,
          letterSpacing: "-.02em",
          lineHeight: 1.25,
          marginTop: 6,
          color: "#1A1512",
        }}
      >
        {product.name}
      </h3>

      {/* Rating row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 7,
        }}
      >
        {/* Gold star */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="#C8922E"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 0l1.12 3.45h3.63l-2.94 2.13 1.12 3.45L5 6.9 2.07 9.03l1.12-3.45L.25 3.45h3.63L5 0z" />
        </svg>
        <span style={{ fontSize: 11.5, color: "#7C7268", lineHeight: 1 }}>
          4.8 (24)
        </span>
      </div>

      {/* Price + WhatsApp row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #E7E1D7",
          marginTop: 11,
          paddingTop: 10,
        }}
      >
        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-.02em",
              color: "#1A1512",
            }}
          >
            {firstWeight ? formatPrice(firstWeight.price) : "--"}
          </span>
          {firstWeight && (
            <span style={{ fontSize: 11, color: "#7C7268" }}>
              / {firstWeight.label}
            </span>
          )}
        </div>

        {/* WhatsApp button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(getWhatsAppLink(product, firstWeight?.label), "_blank");
          }}
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1FA855",
            borderRadius: 2,
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
          aria-label={`Order ${product.name} on WhatsApp`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#fff"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.01a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
    </Link>
  );
}
