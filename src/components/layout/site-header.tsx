"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { getWhatsAppLink } from "@/lib/constants";

const NAV_ITEMS = [
  { label: "Shop All", href: "/products" },
  { label: "Nuts", href: "/products?category=nuts" },
  { label: "Dried Fruits", href: "/products?category=dried-fruits" },
  { label: "Seeds", href: "/products?category=seeds" },
  { label: "Gift Boxes", href: "/products?category=gift-boxes" },
  { label: "Journal", href: "/blog" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className="fixed left-0 right-0 z-50 border-b"
      style={{
        top: 34,
        height: 66,
        background: "rgba(251,249,245,.88)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        borderBottomColor: "#E7E1D7",
      }}
    >
      <div
        className="mx-auto flex items-center h-full"
        style={{
          maxWidth: 1400,
          padding: "0 28px",
          gap: 36,
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div
            style={{
              fontSize: 25,
              fontWeight: 800,
              letterSpacing: "-.05em",
              lineHeight: 1,
              color: "#1A1512",
            }}
          >
            QAAQ
          </div>
          <div
            style={{
              fontSize: 8,
              letterSpacing: ".42em",
              textTransform: "uppercase",
              color: "#7C7268",
              fontWeight: 600,
              marginTop: 3,
            }}
          >
            Dry Fruits
          </div>
        </Link>

        {/* Center nav */}
        <nav
          className="hidden lg:flex items-center"
          style={{ gap: 26 }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === pathname ||
              (item.href.startsWith("/products?") &&
                pathname === "/products") ||
              (item.href === "/products" && pathname === "/products");

            return (
              <Link
                key={item.href}
                href={item.href}
                className="qaaq-und"
                style={{
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: isActive ? "#1A1512" : "#7C7268",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#1A1512";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isActive
                    ? "#1A1512"
                    : "#7C7268";
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center" style={{ gap: 12 }}>
          {/* Search box */}
          <div
            className="hidden md:flex items-center"
            style={{
              height: 38,
              border: "1px solid #E7E1D7",
              background: "#FFFFFF",
              borderRadius: 3,
              padding: "0 12px",
              gap: 8,
            }}
          >
            <Search
              style={{ width: 15, height: 15, color: "#7C7268", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "12.5px",
                color: "#B0A69A",
                whiteSpace: "nowrap",
              }}
            >
              Search 12 products...
            </span>
            <kbd
              style={{
                fontSize: 10,
                color: "#B0A69A",
                border: "1px solid #E7E1D7",
                borderRadius: 2,
                padding: "1px 5px",
                marginLeft: 8,
                lineHeight: "16px",
                fontFamily: "inherit",
              }}
            >
              ⌘K
            </kbd>
          </div>

          {/* Bag button */}
          <button
            type="button"
            className="relative flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              border: "1px solid #E7E1D7",
              borderRadius: 3,
              background: "#FFFFFF",
            }}
          >
            <ShoppingBag style={{ width: 17, height: 17, color: "#1A1512" }} />
            <span
              className="absolute flex items-center justify-center"
              style={{
                top: -5,
                right: -5,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#C8922E",
                color: "#FFFFFF",
                fontSize: 9,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              0
            </span>
          </button>

          {/* WhatsApp CTA */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center qaaq-press"
            style={{
              height: 38,
              background: "#1A1512",
              color: "#FFFFFF",
              borderRadius: 3,
              padding: "0 16px",
              gap: 7,
              fontSize: "12.5px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ flexShrink: 0 }}
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Order on WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
