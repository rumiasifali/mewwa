"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X, ChevronDown, Star, Check, Package, MessageCircle } from "lucide-react";
import { CatalogCard } from "@/components/products/catalog-card";
import { getWhatsAppLink } from "@/lib/constants";
import { useSiteSettings } from "@/contexts/site-settings-context";
import type { Product, Category } from "@/types";

/* ────────────────────────────────────────────
   Colors (design tokens)
   ──────────────────────────────────────────── */
const C = {
  ink: "#1A1512",
  gold: "#C8922E",
  paper: "#FBF9F5",
  paper2: "#F5F1EA",
  line: "#E7E1D7",
  line3: "#DCD3C5",
  muted: "#7C7268",
  body: "#4A4139",
  faint: "#B0A69A",
  muted2: "#9A9086",
} as const;

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
type Density = "dense" | "roomy";
type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
};

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function getLowestPrice(p: Product): number {
  if (!p.weights || p.weights.length === 0) return 0;
  return Math.min(...p.weights.map((w) => w.price));
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "featured":
      return copy.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    case "price-asc":
      return copy.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    case "price-desc":
      return copy.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    case "newest":
      return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    default:
      return copy;
  }
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */
export function ProductsGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { whatsappNumber } = useSiteSettings();

  /* ── state ── */
  const categoryParam = searchParams.get("category");
  const [activeCategories, setActiveCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("dense");
  const [sort, setSort] = useState<SortKey>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Sync from the URL param when it changes (render-time state
     adjustment — searchParams is the external source of truth) */
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    if (categoryParam && !activeCategories.includes(categoryParam)) {
      setActiveCategories([categoryParam]);
    }
  }

  /* Update URL when category changes */
  const updateCategoryURL = useCallback(
    (cats: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cats.length === 1) {
        params.set("category", cats[0]);
      } else {
        params.delete("category");
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""), { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /* Toggle category */
  const toggleCategory = useCallback(
    (slug: string) => {
      setLoading(true);
      const next = activeCategories.includes(slug)
        ? activeCategories.filter((c) => c !== slug)
        : [...activeCategories, slug];
      setActiveCategories(next);
      updateCategoryURL(next);
      setTimeout(() => setLoading(false), 400);
    },
    [activeCategories, updateCategoryURL]
  );

  const clearCategory = useCallback(
    (slug: string) => {
      const next = activeCategories.filter((c) => c !== slug);
      setActiveCategories(next);
      updateCategoryURL(next);
    },
    [activeCategories, updateCategoryURL]
  );

  /* ── derived data ── */
  const filtered = useMemo(() => {
    let result = [...products];

    // category filter
    if (activeCategories.length > 0) {
      result = result.filter((p) => activeCategories.includes(p.category));
    }

    // search filter (searches name, description, origin, tags)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // toggle filters
    if (inStockOnly) {
      result = result.filter((p) => p.is_available);
    }
    if (featuredOnly) {
      result = result.filter((p) => p.is_featured);
    }

    // sort
    result = sortProducts(result, sort);

    return result;
  }, [products, activeCategories, search, sort, inStockOnly, featuredOnly]);

  /* ── counts per category ── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const inStockCount = useMemo(() => products.filter((p) => p.is_available).length, [products]);
  const uniqueOrigins = useMemo(
    () => new Set(products.map((p) => p.origin).filter(Boolean)).size,
    [products]
  );

  /* ── active category name ── */
  const activeCategoryName = useMemo(() => {
    if (activeCategories.length === 1) {
      const cat = categories.find((c) => c.slug === activeCategories[0]);
      return cat?.name || "All Products";
    }
    return "All Products";
  }, [activeCategories, categories]);

  const gridCols = density === "dense" ? 4 : 3;

  /* ────────────────────────────────────────────
     Render
     ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ═══════════════════════════════════════
          1. CATALOG HEADER
          ═══════════════════════════════════════ */}
      <div
        style={{
          background: C.paper2,
          borderBottom: `1px solid ${C.line}`,
          paddingTop: 96,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "34px 28px 30px",
          }}
        >
          {/* Breadcrumb */}
          <nav
            style={{
              fontSize: 11.5,
              color: C.muted,
              marginBottom: 16,
              fontWeight: 400,
            }}
          >
            <Link
              href="/"
              style={{ color: C.muted, textDecoration: "none" }}
            >
              Home
            </Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: C.body, fontWeight: 500 }}>
              {activeCategoryName === "All Products"
                ? "All Products"
                : activeCategoryName}
            </span>
          </nav>

          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 32,
            }}
          >
            {/* Left: title + subtitle */}
            <div>
              <h1
                style={{
                  fontSize: "clamp(34px, 4.2vw, 52px)",
                  fontWeight: 800,
                  letterSpacing: "-.045em",
                  lineHeight: 1,
                  color: C.ink,
                  margin: 0,
                }}
              >
                {activeCategoryName}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: C.body,
                  marginTop: 12,
                  lineHeight: 1.6,
                  maxWidth: 520,
                }}
              >
                Premium dry fruits and nuts, handpicked from the finest origins.
              </p>
            </div>

            {/* Right: stat boxes */}
            <div
              style={{
                display: "flex",
                gap: 1,
                background: C.line,
                flexShrink: 0,
              }}
            >
              {/* In stock stat */}
              <div
                style={{
                  background: C.paper,
                  padding: "12px 20px",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    color: C.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {inStockCount}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: ".16em",
                    textTransform: "uppercase" as const,
                    color: C.muted,
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  In stock
                </div>
              </div>

              {/* Origins stat */}
              <div
                style={{
                  background: C.paper,
                  padding: "12px 20px",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    color: C.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {uniqueOrigins}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: ".16em",
                    textTransform: "uppercase" as const,
                    color: C.muted,
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  Origins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          2. TWO-COLUMN LAYOUT
          ═══════════════════════════════════════ */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 28px",
        }}
      >
        {/* Mobile filter pills (visible on small screens only) */}
        <div className="lg:hidden" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((cat) => {
              const isActive = activeCategories.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  style={{
                    background: isActive ? C.ink : C.paper,
                    color: isActive ? "#fff" : C.body,
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "6px 12px",
                    borderRadius: 2,
                    border: `1px solid ${isActive ? C.ink : C.line3}`,
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 36,
          }}
          className="lg:grid-cols-[232px_1fr] grid-cols-1"
        >
          {/* ═══════════════════════════════════
              3. FACET SIDEBAR
              ═══════════════════════════════════ */}
          <aside
            className="hidden lg:block"
            style={{
              position: "sticky",
              top: 112,
              alignSelf: "start",
              padding: "28px 0 60px",
            }}
          >
            {/* Search input */}
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: 11,
                  top: 13,
                  width: 14,
                  height: 14,
                  color: C.muted2,
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search products, origins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  paddingLeft: 34,
                  paddingRight: search ? 32 : 12,
                  border: `1px solid ${C.line3}`,
                  background: "#fff",
                  borderRadius: 2,
                  fontSize: 13,
                  color: C.ink,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X style={{ width: 13, height: 13, color: C.muted }} />
                </button>
              )}
            </div>

            {/* Category facet */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: `1px solid ${C.line}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".2em",
                    textTransform: "uppercase" as const,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  Category
                </span>
                <ChevronDown
                  style={{ width: 12, height: 12, color: C.muted2 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {categories.map((cat) => {
                  const isChecked = activeCategories.includes(cat.slug);
                  return (
                    <label
                      key={cat.slug}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => toggleCategory(cat.slug)}
                    >
                      {/* Checkbox */}
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 2,
                          border: `1px solid ${isChecked ? C.ink : C.line3}`,
                          background: isChecked ? C.ink : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all .15s",
                        }}
                      >
                        {isChecked && (
                          <svg
                            width="9"
                            height="7"
                            viewBox="0 0 9 7"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 3.5L3.5 6L8 1"
                              stroke="#fff"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* Label */}
                      <span
                        style={{
                          fontSize: 13,
                          color: isChecked ? C.ink : C.body,
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        {cat.name}
                      </span>
                      {/* Count */}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11.5,
                          color: C.faint,
                        }}
                      >
                        {categoryCounts[cat.slug] || 0}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Toggles section */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: `1px solid ${C.line}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* In stock only */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: C.body }}>
                  In stock only
                </span>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  style={{
                    width: 30,
                    height: 17,
                    borderRadius: 9,
                    border: "none",
                    background: inStockOnly ? C.ink : C.line3,
                    position: "relative",
                    cursor: "pointer",
                    padding: 0,
                    transition: "background .2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: inStockOnly ? 15 : 2,
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .2s",
                    }}
                  />
                </button>
              </div>

              {/* Featured */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: C.body }}>Featured</span>
                <button
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  style={{
                    width: 30,
                    height: 17,
                    borderRadius: 9,
                    border: "none",
                    background: featuredOnly ? C.ink : C.line3,
                    position: "relative",
                    cursor: "pointer",
                    padding: 0,
                    transition: "background .2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: featuredOnly ? 15 : 2,
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .2s",
                    }}
                  />
                </button>
              </div>
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════
              RESULTS COLUMN
              ═══════════════════════════════════ */}
          <div style={{ padding: "28px 0 90px" }}>
            {/* ═══════════════════════════════
                4. RESULTS TOOLBAR
                ═══════════════════════════════ */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 16,
                borderBottom: `1px solid ${C.ink}`,
                marginBottom: 0,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {/* Left: count + active chips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 13, color: C.body }}>
                  Showing{" "}
                  <strong style={{ fontWeight: 700, color: C.ink }}>
                    {filtered.length}
                  </strong>{" "}
                  of {products.length}
                </span>

                {activeCategories.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  if (!cat) return null;
                  return (
                    <button
                      key={slug}
                      onClick={() => clearCategory(slug)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        background: C.ink,
                        color: "#fff",
                        fontSize: 11.5,
                        fontWeight: 500,
                        padding: "5px 9px",
                        borderRadius: 2,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {cat.name}
                      <X style={{ width: 10, height: 10 }} />
                    </button>
                  );
                })}
              </div>

              {/* Right: density + sort */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {/* Density toggle */}
                <div
                  style={{
                    display: "flex",
                    gap: 1,
                    background: C.line3,
                    border: `1px solid ${C.line3}`,
                    borderRadius: 2,
                  }}
                >
                  <button
                    onClick={() => setDensity("dense")}
                    title="4-column grid"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: density === "dense" ? C.paper : "#fff",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px 9px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill={density === "dense" ? C.ink : C.muted}>
                      <rect x="0" y="0" width="4" height="4" />
                      <rect x="5" y="0" width="4" height="4" />
                      <rect x="10" y="0" width="4" height="4" />
                      <rect x="0" y="5" width="4" height="4" />
                      <rect x="5" y="5" width="4" height="4" />
                      <rect x="10" y="5" width="4" height="4" />
                      <rect x="0" y="10" width="4" height="4" />
                      <rect x="5" y="10" width="4" height="4" />
                      <rect x="10" y="10" width="4" height="4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDensity("roomy")}
                    title="3-column grid"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: density === "roomy" ? C.paper : "#fff",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px 9px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill={density === "roomy" ? C.ink : C.muted}>
                      <rect x="0" y="0" width="6" height="6" />
                      <rect x="8" y="0" width="6" height="6" />
                      <rect x="0" y="8" width="6" height="6" />
                      <rect x="8" y="8" width="6" height="6" />
                    </svg>
                  </button>
                </div>

                {/* Sort dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      height: 32,
                      padding: "0 11px",
                      border: `1px solid ${C.line3}`,
                      background: "#fff",
                      borderRadius: 2,
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: C.body,
                      cursor: "pointer",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    <span style={{ color: "#7C7268" }}>Sort</span>{" "}
                    <span style={{ color: "#1A1512" }}>{SORT_LABELS[sort]}</span>
                    <ChevronDown
                      style={{
                        width: 12,
                        height: 12,
                        color: C.ink,
                        transform: sortOpen ? "rotate(180deg)" : "none",
                        transition: "transform .15s",
                      }}
                    />
                  </button>

                  {sortOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          zIndex: 40,
                        }}
                        onClick={() => setSortOpen(false)}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          right: 0,
                          zIndex: 50,
                          background: "#fff",
                          border: `1px solid ${C.line}`,
                          borderRadius: 2,
                          boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                          minWidth: 180,
                          overflow: "hidden",
                        }}
                      >
                        {(
                          Object.entries(SORT_LABELS) as [SortKey, string][]
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSort(key);
                              setSortOpen(false);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              width: "100%",
                              padding: "9px 14px",
                              fontSize: 12.5,
                              color: sort === key ? C.ink : C.body,
                              fontWeight: sort === key ? 600 : 400,
                              background:
                                sort === key ? C.paper2 : "transparent",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left" as const,
                            }}
                          >
                            {sort === key && (
                              <Check
                                style={{ width: 12, height: 12, color: C.ink }}
                              />
                            )}
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════
                5. PRODUCT GRID
                ═══════════════════════════════ */}
            {loading ? (
              /* Skeleton grid */
              <div
                style={{
                  display: "grid",
                  gap: 1,
                  background: C.line,
                  borderTop: `1px solid ${C.line}`,
                  marginTop: 0,
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                }}
                className={`!grid-cols-2 sm:!grid-cols-3 ${
                  density === "dense"
                    ? "lg:!grid-cols-4"
                    : "lg:!grid-cols-3"
                }`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ background: C.paper, padding: "14px 14px 16px" }}
                  >
                    {/* Image skeleton */}
                    <div
                      style={{
                        aspectRatio: "1",
                        background: "#EFEAE2",
                        borderRadius: 0,
                      }}
                      className="animate-pulse"
                    />
                    {/* Origin skeleton */}
                    <div
                      style={{
                        width: 60,
                        height: 8,
                        background: C.paper2,
                        marginTop: 12,
                        borderRadius: 1,
                      }}
                      className="animate-pulse"
                    />
                    {/* Title skeleton */}
                    <div
                      style={{
                        width: "80%",
                        height: 14,
                        background: C.paper2,
                        marginTop: 8,
                        borderRadius: 1,
                      }}
                      className="animate-pulse"
                    />
                    {/* Rating skeleton */}
                    <div
                      style={{
                        width: 50,
                        height: 8,
                        background: C.paper2,
                        marginTop: 10,
                        borderRadius: 1,
                      }}
                      className="animate-pulse"
                    />
                    {/* Price row skeleton */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: `1px solid ${C.line}`,
                        marginTop: 11,
                        paddingTop: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 70,
                          height: 14,
                          background: C.paper2,
                          borderRadius: 1,
                        }}
                        className="animate-pulse"
                      />
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          background: C.paper2,
                          borderRadius: 2,
                        }}
                        className="animate-pulse"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* ═══════════════════════════════
                 EMPTY STATE
                 ═══════════════════════════════ */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "80px 20px",
                  textAlign: "center",
                }}
              >
                <Package
                  style={{
                    width: 48,
                    height: 48,
                    color: C.line3,
                    marginBottom: 20,
                    strokeWidth: 1,
                  }}
                />
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.ink,
                    letterSpacing: "-.02em",
                    margin: 0,
                  }}
                >
                  Nothing in this aisle yet
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    marginTop: 8,
                    maxWidth: 320,
                    lineHeight: 1.5,
                  }}
                >
                  We&apos;re always adding new products. Reach out to us or browse
                  our full catalog.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 24,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <a
                    href={getWhatsAppLink(undefined, undefined, whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "10px 18px",
                      background: "#1FA855",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 2,
                      textDecoration: "none",
                    }}
                  >
                    <MessageCircle style={{ width: 14, height: 14 }} />
                    WhatsApp us
                  </a>
                  <button
                    onClick={() => {
                      setActiveCategories([]);
                      setSearch("");
                      setInStockOnly(false);
                      setFeaturedOnly(false);
                      updateCategoryURL([]);
                    }}
                    style={{
                      padding: "10px 18px",
                      background: C.ink,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 2,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Browse everything
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Product grid */}
                <div
                  style={{
                    display: "grid",
                    gap: 1,
                    background: C.line,
                    borderTop: `1px solid ${C.line}`,
                    marginTop: 0,
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  }}
                  className={`!grid-cols-2 sm:!grid-cols-3 ${
                    density === "dense"
                      ? "lg:!grid-cols-4"
                      : "lg:!grid-cols-3"
                  }`}
                >
                  {filtered.map((product) => (
                    <CatalogCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ═══════════════════════════════
                    6. END STATE
                    ═══════════════════════════════ */}
                <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  {/* Progress bar */}
                  <div
                    style={{
                      width: 180,
                      height: 2,
                      background: C.line,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: C.ink,
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: C.muted,
                      margin: 0,
                    }}
                  >
                    You&apos;ve seen all{" "}
                    <strong style={{ color: C.body, fontWeight: 600 }}>
                      {filtered.length}
                    </strong>{" "}
                    products in this aisle
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategories([]);
                      setSearch("");
                      setInStockOnly(false);
                      setFeaturedOnly(false);
                      updateCategoryURL([]);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      height: 44,
                      padding: "0 24px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: C.ink,
                      background: "transparent",
                      border: `1px solid ${C.ink}`,
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    Browse everything
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
