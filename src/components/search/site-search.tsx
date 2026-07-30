"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import type { SearchResponse, SearchResult, SearchResultType } from "@/types";

/* ── Design tokens ── */
const C = {
  ink: "#1A1512",
  gold: "#C8922E",
  paper: "#FBF9F5",
  paper2: "#F5F1EA",
  line: "#E7E1D7",
  muted: "#7C7268",
  body: "#4A4139",
  faint: "#B0A69A",
} as const;

/* ── Section labels for result groups ── */
const SECTION_LABELS: Record<SearchResultType, string> = {
  product: "Products",
  category: "Categories",
  post: "Journal",
};

const SECTION_ORDER: SearchResultType[] = ["product", "category", "post"];

/* ── Group results by type ── */
function groupResults(results: SearchResult[]) {
  const groups: Partial<Record<SearchResultType, SearchResult[]>> = {};
  for (const r of results) {
    if (!groups[r.result_type]) groups[r.result_type] = [];
    groups[r.result_type]!.push(r);
  }
  return groups;
}

export function SiteSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ── Debounced fetch ── */
  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json: SearchResponse = await res.json();
      setData(json);
      setActiveIndex(-1);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchResults(value.trim()), 300);
  };

  /* ── Cmd+K shortcut ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Click outside to close ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Flatten results for keyboard nav ── */
  const allItems = data
    ? [...data.results, ...data.recommendations]
    : [];

  /* ── Navigate to result ── */
  const navigateTo = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    setData(null);
    router.push(result.url);
  };

  /* ── Keyboard navigation ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0 && allItems[activeIndex]) {
      e.preventDefault();
      navigateTo(allItems[activeIndex]);
    }
  };

  /* ── Should show dropdown ── */
  const showDropdown = open && query.length >= 2 && (loading || data !== null);
  const hasResults = data && data.results.length > 0;
  const hasRecommendations = data && data.recommendations.length > 0;
  const noResults = data && data.results.length === 0 && data.recommendations.length === 0;

  const groupedResults = hasResults ? groupResults(data.results) : {};
  const groupedRecs = hasRecommendations ? groupResults(data.recommendations) : {};

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* ── Search Input ── */}
      <div
        className="hidden md:flex items-center"
        style={{
          height: 38,
          border: `1px solid ${open && query ? C.ink : C.line}`,
          background: "#FFFFFF",
          borderRadius: 3,
          padding: "0 12px",
          gap: 8,
          transition: "border-color .2s",
          width: 210,
        }}
      >
        {loading ? (
          <Loader2
            style={{ width: 15, height: 15, color: C.muted, flexShrink: 0 }}
            className="animate-spin"
          />
        ) : (
          <Search
            style={{ width: 15, height: 15, color: C.muted, flexShrink: 0 }}
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            boxShadow: "none",
            background: "transparent",
            fontSize: "12.5px",
            color: C.ink,
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setData(null);
              setOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X style={{ width: 13, height: 13, color: C.muted }} />
          </button>
        ) : (
          <kbd
            style={{
              fontSize: 10,
              color: C.faint,
              border: `1px solid ${C.line}`,
              borderRadius: 2,
              padding: "1px 5px",
              lineHeight: "16px",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* ── Dropdown Results ── */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 380,
            maxHeight: 420,
            overflowY: "auto",
            background: "#FFFFFF",
            border: `1px solid ${C.line}`,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,.10)",
            zIndex: 100,
          }}
        >
          {/* Loading state */}
          {loading && !data && (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <Loader2
                style={{ width: 20, height: 20, color: C.muted, margin: "0 auto" }}
                className="animate-spin"
              />
              <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
                Searching...
              </p>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div>
              {SECTION_ORDER.map((type) => {
                const items = groupedResults[type];
                if (!items || items.length === 0) return null;
                return (
                  <div key={type}>
                    <div
                      style={{
                        padding: "10px 16px 6px",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".18em",
                        textTransform: "uppercase",
                        color: C.muted,
                      }}
                    >
                      {SECTION_LABELS[type]}
                    </div>
                    {items.map((item) => {
                      const flatIndex = allItems.indexOf(item);
                      return (
                        <ResultRow
                          key={item.id}
                          item={item}
                          isActive={flatIndex === activeIndex}
                          onClick={() => navigateTo(item)}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* No results + recommendations */}
          {!loading && data && data.results.length === 0 && (
            <div>
              {hasRecommendations ? (
                <>
                  <div
                    style={{
                      padding: "16px 16px 6px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: 13, color: C.body, margin: 0 }}>
                      No exact matches for &ldquo;<strong>{data.query}</strong>&rdquo;
                    </p>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                      Did you mean...
                    </p>
                  </div>
                  {SECTION_ORDER.map((type) => {
                    const items = groupedRecs[type];
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={type}>
                        <div
                          style={{
                            padding: "10px 16px 6px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".18em",
                            textTransform: "uppercase",
                            color: C.gold,
                          }}
                        >
                          {SECTION_LABELS[type]}
                        </div>
                        {items.map((item) => {
                          const flatIndex = allItems.indexOf(item);
                          return (
                            <ResultRow
                              key={item.id}
                              item={item}
                              isActive={flatIndex === activeIndex}
                              onClick={() => navigateTo(item)}
                              onMouseEnter={() => setActiveIndex(flatIndex)}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              ) : noResults ? (
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: C.body,
                      margin: 0,
                    }}
                  >
                    No results for &ldquo;<strong>{data.query}</strong>&rdquo;
                  </p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                    Try a different keyword or browse our catalog.
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      setData(null);
                      router.push("/products");
                    }}
                    style={{
                      marginTop: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      background: C.ink,
                      color: "#fff",
                      border: "none",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    Browse all products
                    <ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Single result row ── */
function ResultRow({
  item,
  isActive,
  onClick,
  onMouseEnter,
}: {
  item: SearchResult;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 16px",
        background: isActive ? C.paper : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background .1s",
      }}
    >
      {/* Thumbnail */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt=""
          style={{
            width: 36,
            height: 36,
            objectFit: "cover",
            borderRadius: 2,
            background: C.paper,
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: C.paper,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search style={{ width: 14, height: 14, color: C.faint }} />
        </div>
      )}

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>
        {item.subtitle && (
          <div
            style={{
              fontSize: 11.5,
              color: C.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 1,
            }}
          >
            {item.subtitle}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight
        style={{
          width: 13,
          height: 13,
          color: isActive ? C.muted : "transparent",
          flexShrink: 0,
          transition: "color .1s",
        }}
      />
    </button>
  );
}
