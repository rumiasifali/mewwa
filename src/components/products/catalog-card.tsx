"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import type { Product } from "@/types";

export function CatalogCard({ product }: { product: Product }) {
  const firstWeight = product.weights[0];
  const grade = product.tags.find(
    (t) => t.toLowerCase() !== "bestseller" && t.toLowerCase() !== "rare"
  );
  const { user, openAuthModal } = useAuth();
  const { addItem, openCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!firstWeight) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.image_url,
      origin: product.origin,
      weightGrams: firstWeight.grams,
      weightLabel: firstWeight.label,
      price: firstWeight.price,
      currency: firstWeight.currency || "PKR",
    });

    toast("Added to your order", {
      description: `${product.name} — ${firstWeight.label}`,
      action: {
        label: "View cart",
        onClick: () => openCart(),
      },
      duration: 3000,
    });
  };

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
        <svg width="10" height="10" viewBox="0 0 10 10" fill="#C8922E">
          <path d="M5 0l1.12 3.45h3.63l-2.94 2.13 1.12 3.45L5 6.9 2.07 9.03l1.12-3.45L.25 3.45h3.63L5 0z" />
        </svg>
        <span style={{ fontSize: 11.5, color: "#7C7268", lineHeight: 1 }}>
          4.8 (24)
        </span>
      </div>

      {/* Price row */}
      <div
        style={{
          borderTop: "1px solid #E7E1D7",
          marginTop: 11,
          paddingTop: 10,
        }}
      >
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

        {/* Add to Cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="qaaq-press"
          style={{
            marginTop: 10,
            width: "100%",
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "#1A1512",
            color: "#fff",
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: ".01em",
            borderRadius: 2,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Plus style={{ width: 11, height: 11 }} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
