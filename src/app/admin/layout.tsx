"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/posts", label: "Journal" },
  { href: "/admin/testimonials", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(async ({ data: { user } }: { data: { user: { id: string } | null } }) => {
        if (!user) {
          router.push("/login?redirectTo=" + encodeURIComponent(pathname));
          return;
        }
        // Server-side enforcement lives in proxy.ts + RLS; this check just
        // keeps non-admins from seeing a broken shell.
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role !== "admin") {
          router.push("/");
          return;
        }
        {
          setAuthChecked(true);
          // Fetch counts for sidebar
          Promise.all([
            supabase
              .from("orders")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("products")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("categories")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("posts")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("testimonials")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
          ]).then(([orders, products, categories, posts, reviews]) => {
            setCounts({
              "/admin/orders": orders.count || 0,
              "/admin/products": products.count || 0,
              "/admin/categories": categories.count || 0,
              "/admin/posts": posts.count || 0,
              "/admin/testimonials": reviews.count || 0,
            });
          });
        }
      });
  }, [router, pathname]);

  // Live order notifications while the panel is open
  useEffect(() => {
    if (!authChecked) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-order-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: { new: { ref?: string; customer_name?: string; total?: number } }) => {
          const order = payload.new;
          toast.success(`New order ${order.ref || ""}`, {
            description: `${order.customer_name || "Customer"} — PKR ${Number(order.total || 0).toLocaleString()}`,
            duration: 15000,
            action: {
              label: "View",
              onClick: () => router.push("/admin/orders"),
            },
          });
          setCounts((prev) => ({
            ...prev,
            "/admin/orders": (prev["/admin/orders"] || 0) + 1,
          }));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [authChecked, router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!authChecked) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F1EA",
        }}
      >
        <Loader2
          className="animate-spin"
          style={{ width: 24, height: 24, color: "#9A9086" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F1EA",
      }}
    >
      {/* Dark sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: 212,
          flexShrink: 0,
          background: "#1A1512",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "22px 18px 18px",
            borderBottom: "1px solid rgba(255,255,255,.1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-.04em",
              color: "#fff",
            }}
          >
            QAAQ
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "#C8922E",
              border: "1px solid rgba(200,146,46,.4)",
              padding: "2px 6px",
              fontWeight: 700,
            }}
          >
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 2,
                  fontSize: 13,
                  fontWeight: isActive ? 650 : 500,
                  background: isActive
                    ? "rgba(255,255,255,.1)"
                    : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,.6)",
                  textDecoration: "none",
                  transition: "background .15s",
                }}
              >
                {link.label}
                {counts[link.href] !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      color: isActive
                        ? "#C8922E"
                        : "rgba(255,255,255,.3)",
                    }}
                  >
                    {counts[link.href]}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storage meter */}
        <div
          style={{
            marginTop: 12,
            padding: "14px 18px",
            borderTop: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.35)",
              fontWeight: 700,
            }}
          >
            Storage
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "rgba(255,255,255,.45)",
            }}
          >
            Managed in Supabase dashboard
          </div>
        </div>

        {/* Bottom actions */}
        <div
          style={{
            padding: "12px 10px 18px",
            borderTop: "1px solid rgba(255,255,255,.1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              fontSize: 13,
              color: "rgba(255,255,255,.55)",
              textDecoration: "none",
              borderRadius: 2,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 12H5M11 6l-6 6 6 6" />
            </svg>
            Back to site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              fontSize: 13,
              color: "#B4551F",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: 2,
              width: "100%",
              textAlign: "left",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 17l5-5-5-5M20 12H9M11 4H6v16h5" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center justify-between"
          style={{
            padding: "12px 16px",
            background: "#1A1512",
            borderBottom: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}
            >
              QAAQ
            </span>
            <span
              style={{
                fontSize: 8,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#C8922E",
                fontWeight: 700,
              }}
            >
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.5)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 17l5-5-5-5M20 12H9M11 4H6v16h5" />
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        <nav
          className="md:hidden flex"
          style={{
            gap: 0,
            overflowX: "auto",
            background: "#fff",
            borderBottom: "1px solid #E7E1D7",
          }}
        >
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: isActive ? 650 : 500,
                  color: isActive ? "#1A1512" : "#7C7268",
                  borderBottom: `2px solid ${isActive ? "#C8922E" : "transparent"}`,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div
          style={{
            background: "#FBF9F5",
            borderLeft: "1px solid #E7E1D7",
            padding: "26px 30px 90px",
            minHeight: "100vh",
          }}
        >
          {children}
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1A1512",
              color: "#fff",
              border: "none",
              borderRadius: 2,
              fontSize: 13,
            },
          }}
        />
      </div>
    </div>
  );
}
