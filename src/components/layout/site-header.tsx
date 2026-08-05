"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, ClipboardList } from "lucide-react";
import { getWhatsAppLink } from "@/lib/constants";
import { SiteSearch } from "@/components/search/site-search";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

const NAV_ITEMS = [
  { label: "Shop All", href: "/products" },
  { label: "Nuts", href: "/products?category=nuts" },
  { label: "Dried Fruits", href: "/products?category=dried-fruits" },
  { label: "Seeds", href: "/products?category=seeds" },
  { label: "Gift Boxes", href: "/products?category=gift-boxes", gold: true },
  { label: "Origins", href: "/about" },
  { label: "Journal", href: "/blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, profile, loading, openAuthModal, signOut } = useAuth();
  const { itemCount, openCart } = useCart();
  const [acctMenu, setAcctMenu] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAcctMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setAcctMenu(false);
    setMoreOpen(false);
  }, [pathname]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const handleBagClick = () => {
    if (!user) {
      openAuthModal("login");
    } else {
      openCart();
    }
  };

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
          style={{
            gap: 26,
            fontSize: 13.5,
            fontWeight: 500,
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === pathname ||
              (item.href.startsWith("/products?") && pathname === "/products") ||
              (item.href === "/products" && pathname === "/products");

            return (
              <Link
                key={item.href}
                href={item.href}
                className="qaaq-und"
                style={{
                  cursor: "pointer",
                  color: item.gold ? "#C8922E" : isActive ? "#1A1512" : "#7C7268",
                  textDecoration: "none",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => {
                  if (!item.gold) (e.currentTarget as HTMLElement).style.color = "#1A1512";
                }}
                onMouseLeave={(e) => {
                  if (!item.gold) {
                    (e.currentTarget as HTMLElement).style.color = isActive ? "#1A1512" : "#7C7268";
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* More dropdown — for overflow items */}
          <div ref={moreRef} style={{ position: "relative" }}>
            <span
              onClick={() => setMoreOpen(!moreOpen)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "#7C7268",
              }}
            >
              More
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                style={{
                  transform: moreOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform .25s cubic-bezier(.22,1,.36,1)",
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>

            {moreOpen && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  top: 32,
                  left: -14,
                  minWidth: 212,
                  background: "#FBF9F5",
                  border: "1px solid #DCD3C5",
                  boxShadow: "0 24px 50px -22px rgba(26,21,18,.4)",
                  display: "flex",
                  flexDirection: "column",
                  padding: "6px 0",
                  animation: "qaaq-rise .18s both",
                  zIndex: 90,
                }}
              >
                {[
                  { label: "About", href: "/about" },
                  { label: "Shipping", href: "/shipping" },
                  { label: "Contact", href: "/contact" },
                  { label: "Feedback", href: "/feedback" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      padding: "9px 16px",
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: pathname === item.href ? "#1A1512" : "#7C7268",
                      textDecoration: "none",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#F0EBE3";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center" style={{ gap: 12 }}>
          {/* Search */}
          <SiteSearch />

          {/* Bag button */}
          <button
            type="button"
            onClick={handleBagClick}
            className="relative flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              border: "1px solid #E7E1D7",
              borderRadius: 3,
              background: "#FFFFFF",
              cursor: "pointer",
              transition: "border-color .2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1A1512";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#E7E1D7";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A1512"
              strokeWidth="1.8"
            >
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9.5 8V6a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            {user && itemCount > 0 && (
              <span
                className="absolute flex items-center justify-center"
                style={{
                  top: -6,
                  right: -6,
                  minWidth: 17,
                  height: 17,
                  padding: "0 4px",
                  borderRadius: 9,
                  background: "#C8922E",
                  color: "#1A1512",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth state: Signed In → Avatar dropdown */}
          {!loading && user && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAcctMenu(!acctMenu)}
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "#1A1512",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: ".02em",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {initials}
              </button>

              {acctMenu && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: 46,
                    right: 0,
                    minWidth: 196,
                    background: "#FBF9F5",
                    border: "1px solid #DCD3C5",
                    boxShadow:
                      "0 24px 50px -22px rgba(26,21,18,.4)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "6px 0",
                    animation: "qaaq-rise .18s both",
                    zIndex: 90,
                  }}
                >
                  {/* Name + email header */}
                  <div
                    style={{
                      padding: "8px 16px 10px",
                      borderBottom: "1px solid #E7E1D7",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 650,
                        color: "#1A1512",
                      }}
                    >
                      {profile?.full_name || "Account"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "#9A9086",
                        marginTop: 2,
                      }}
                    >
                      {user.email}
                    </span>
                  </div>

                  {/* Menu items */}
                  <Link
                    href="/account"
                    role="menuitem"
                    onClick={() => setAcctMenu(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 16px",
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: "#1A1512",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#F0EBE3";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }}
                  >
                    <User style={{ width: 14, height: 14, color: "#7C7268" }} />
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    role="menuitem"
                    onClick={() => setAcctMenu(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 16px",
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: "#1A1512",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#F0EBE3";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }}
                  >
                    <ClipboardList
                      style={{ width: 14, height: 14, color: "#7C7268" }}
                    />
                    Order History
                  </Link>
                  <button
                    role="menuitem"
                    onClick={async () => {
                      setAcctMenu(false);
                      await signOut();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 16px",
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: "#B4551F",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      width: "100%",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#F0EBE3";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }}
                  >
                    <LogOut
                      style={{ width: 14, height: 14, color: "#B4551F" }}
                    />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Auth state: Signed Out → Sign In link */}
          {!loading && !user && (
            <button
              onClick={() => openAuthModal("login")}
              className="qaaq-und hidden sm:block"
              style={{
                flexShrink: 0,
                fontSize: "13.5px",
                fontWeight: 500,
                color: "#1A1512",
                padding: "0 2px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign In
            </button>
          )}

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
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: ".01em",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "none",
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
