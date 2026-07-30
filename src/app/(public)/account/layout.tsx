"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, MessageCircle } from "lucide-react";

const C = {
  ink: "#1A1512",
  gold: "#C8922E",
  paper: "#FBF9F5",
  paper2: "#F5F1EA",
  line: "#E7E1D7",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
  warn: "#B4551F",
} as const;

const NAV_ITEMS = [
  { label: "Overview", href: "/account", meta: "" },
  { label: "Order History", href: "/account/orders", meta: "" },
  { label: "Addresses", href: "/account/addresses", meta: "" },
  { label: "Settings", href: "/account/settings", meta: "" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      style={{
        background: C.paper2,
        minHeight: "calc(100vh - 100px)",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 28px",
          display: "grid",
          alignItems: "start",
        }}
        className="lg:grid-cols-[236px_1fr] grid-cols-1"
      >
        {/* Sidebar */}
        <aside
          className="hidden lg:block"
          style={{
            background: C.paper,
            borderLeft: `1px solid ${C.line}`,
            borderRight: `1px solid ${C.line}`,
            padding: "26px 20px 30px",
            minHeight: "calc(100vh - 100px)",
            position: "sticky",
            top: 100,
          }}
        >
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: C.ink,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14.5,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 650,
                  letterSpacing: "-.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile?.full_name || "Account"}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: C.muted2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 12px",
                    fontSize: 13.5,
                    fontWeight: isActive ? 650 : 500,
                    color: isActive ? C.ink : C.muted,
                    background: isActive ? "#EDE7DC" : "transparent",
                    borderLeft: `2px solid ${isActive ? C.gold : "transparent"}`,
                    textDecoration: "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "#F0EBE3";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  {item.label}
                  {item.meta && (
                    <span style={{ fontSize: 11.5, color: C.faint }}>
                      {item.meta}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Log out */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: `1px solid ${C.line}`,
            }}
          >
            <button
              onClick={signOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
                fontSize: 13,
                fontWeight: 600,
                color: C.warn,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              Log out
            </button>
          </div>

          {/* WhatsApp help note */}
          <div
            style={{
              marginTop: 26,
              padding: 14,
              background: C.paper2,
              borderLeft: `2px solid ${C.gold}`,
            }}
          >
            <div
              style={{ fontSize: 11.5, color: "#3A332C", lineHeight: 1.55 }}
            >
              Something wrong with an order? We answer on WhatsApp in minutes.
            </div>
          </div>
        </aside>

        {/* Mobile nav */}
        <div
          className="lg:hidden"
          style={{
            display: "flex",
            gap: 0,
            borderBottom: `1px solid ${C.line}`,
            background: C.paper,
            overflowX: "auto",
            marginBottom: 0,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "14px 18px",
                  fontSize: 13,
                  fontWeight: isActive ? 650 : 500,
                  color: isActive ? C.ink : C.muted,
                  borderBottom: `2px solid ${isActive ? C.gold : "transparent"}`,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div
          style={{
            background: C.paper,
            borderRight: `1px solid ${C.line}`,
            padding: "26px 30px 90px",
            minHeight: "calc(100vh - 100px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
