"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { deleteImageFromUrl } from "@/lib/supabase/storage";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  product_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    sort_order: 0,
  });

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    if (cats) {
      // Head-count products per category in parallel (no row transfer)
      const countResults = await Promise.all(
        cats.map((c: Category) =>
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("category_id", c.id)
        )
      );

      setCategories(
        cats.map((c: Category, i: number) => ({
          ...c,
          product_count: countResults[i].count ?? 0,
        }))
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    void load();
  }, [fetchData]);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function resetForm() {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      sort_order: categories.length,
    });
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image_url: cat.image_url || "",
      sort_order: cat.sort_order,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, slug: form.slug || generateSlug(form.name) };

    if (editing && editing.image_url !== form.image_url && editing.image_url) {
      await deleteImageFromUrl(editing.image_url);
    }

    if (editing) {
      await supabase.from("categories").update(data).eq("id", editing.id);
    } else {
      await supabase.from("categories").insert(data);
    }

    setSaving(false);
    resetForm();
    fetchData();
  }

  async function handleDelete() {
    if (!deleteConfirm) return;

    if (deleteConfirm.image_url) {
      await deleteImageFromUrl(deleteConfirm.image_url);
    }

    await supabase.from("categories").delete().eq("id", deleteConfirm.id);
    setDeleteConfirm(null);
    if (editing?.id === deleteConfirm.id) resetForm();
    fetchData();
  }

  /* #26/#27 — input height 38, fontSize 13.5 */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 38,
    padding: "0 12px",
    fontSize: 13.5,
    color: "#1A1512",
    border: "1px solid #DCD3C5",
    borderRadius: 2,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    transition: "border-color .15s",
    boxSizing: "border-box",
  };

  /* #23/#24/#25 — label letterSpacing .14em, fontWeight 700, marginBottom 7 */
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".14em",
    color: "#4A4139",
    marginBottom: 7,
  };

  return (
    <div>
      {/* #1 — Header: alignItems flex-end */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-.035em",
              color: "#1A1512",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Categories
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "#7C7268",
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Drag to reorder &mdash; the order here is the order of the aisles on
            the storefront.
          </p>
        </div>
        {/* #3/#4/#5/#6 — button icon 13x13, strokeWidth 2.4, gap 8, padding 0 16px */}
        <button
          type="button"
          onClick={resetForm}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            height: 38,
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: "#1A1512",
            border: "none",
            borderRadius: 2,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New category
        </button>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{ width: 22, height: 22, color: "#9A9086" }}
          />
        </div>
      ) : (
        /* #2 — marginTop 22 on the grid instead of marginBottom on header */
        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Left: Category list */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E7E1D7",
            }}
          >
            {categories.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#9A9086",
                  fontSize: 13.5,
                }}
              >
                No categories yet. Create one using the form on the right.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 56px 1fr 90px 80px 60px", /* #7 */
                    alignItems: "center",
                    gap: 14, /* #8 */
                    padding: "14px 18px",
                    borderBottom: "1px solid #F0EBE3",
                    cursor: "default",
                    transition: "background .12s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FBF9F5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* #9 — Drag handle: three span bars */}
                  <span
                    style={{
                      cursor: "grab",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <span style={{ width: 12, height: 1.5, background: "#C4BAAC" }} />
                    <span style={{ width: 12, height: 1.5, background: "#C4BAAC" }} />
                    <span style={{ width: 12, height: 1.5, background: "#C4BAAC" }} />
                  </span>

                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 56,
                      height: 44,
                      overflow: "hidden",
                      background: "#EDE7DC",
                      border: "1px solid #E0D8CA",
                      flexShrink: 0,
                    }}
                  >
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        width={56}
                        height={44}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#C4BAAC",
                          fontSize: 11,
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="1" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name + description */}
                  <div style={{ minWidth: 0 }}>
                    {/* #10 — fontWeight 600 */}
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#1A1512",
                        lineHeight: 1.3,
                      }}
                    >
                      {cat.name}
                    </div>
                    {cat.description && (
                      /* #11 — fontSize 11.5 */
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#9A9086",
                          marginTop: 2,
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {cat.description}
                      </div>
                    )}
                  </div>

                  {/* #12/#13 — Slug with leading slash, color #7C7268 */}
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "ui-monospace, monospace",
                      color: "#7C7268",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    /{cat.slug}
                  </div>

                  {/* #15/#16 — Item count: fontWeight 600, no textAlign right */}
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#1A1512",
                    }}
                  >
                    {cat.product_count ?? 0}{" "}
                    {cat.product_count === 1 ? "item" : "items"}
                  </div>

                  {/* #17/#18/#19 — Actions: gap 8, justifySelf end, no width/height */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifySelf: "end",
                      gap: 8,
                    }}
                  >
                    <span
                      onClick={() => openEdit(cat)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                      }}
                      title="Edit category"
                    >
                      <Pencil style={{ width: 14, height: 14, color: "#7C7268" }} />
                    </span>
                    <span
                      onClick={() => setDeleteConfirm(cat)}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                      }}
                      title="Delete category"
                    >
                      <Trash2 style={{ width: 14, height: 14, color: "#B4551F" }} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* #20 — Right: Add/Edit form with border, background, padding */}
          <div
            style={{
              position: "sticky",
              top: 126,
              border: "1px solid #E7E1D7",
              background: "#fff",
              padding: 20,
            }}
          >
            {/* #21 — Eyebrow marginBottom 16 */}
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "#1A1512",
                marginBottom: 16,
              }}
            >
              {editing ? "EDIT CATEGORY" : "ADD A CATEGORY"}
            </div>

            {/* #22 — Form gap 14 */}
            <form
              onSubmit={handleSave}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Name */}
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: editing ? f.slug : generateSlug(e.target.value),
                    }))
                  }
                  placeholder="Trail Mixes"
                  required
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#C8922E")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#DCD3C5")
                  }
                />
              </div>

              {/* #28 — Slug with color #7C7268 */}
              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="trail-mixes"
                  style={{
                    ...inputStyle,
                    fontFamily: "ui-monospace, monospace",
                    color: "#7C7268",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#C8922E")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#DCD3C5")
                  }
                />
              </div>

              {/* #29/#30 — Description: resize vertical, lineHeight 1.6 */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="One line — this shows on the aisle tile."
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    padding: "10px 12px",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#C8922E")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#DCD3C5")
                  }
                />
              </div>

              {/* #31 — Tile Image with design wrapper */}
              <div>
                <label style={labelStyle}>Tile Image</label>
                <div
                  style={{
                    aspectRatio: "4/3",
                    background: "#F5F1EA",
                    border: "1px dashed #C4BAAC",
                    overflow: "hidden",
                  }}
                >
                  <ImageUpload
                    value={form.image_url}
                    onChange={(url) =>
                      setForm((f) => ({ ...f, image_url: url }))
                    }
                  />
                </div>
              </div>

              {/* #32/#33 — Submit: height 42, fontWeight 600 */}
              <button
                type="submit"
                disabled={saving || !form.name.trim()}
                style={{
                  width: "100%",
                  height: 42,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background:
                    saving || !form.name.trim() ? "#9A9086" : "#1A1512",
                  border: "none",
                  borderRadius: 2,
                  cursor:
                    saving || !form.name.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background .15s",
                }}
              >
                {saving && (
                  <Loader2
                    className="animate-spin"
                    style={{ width: 14, height: 14 }}
                  />
                )}
                {editing ? "Update category" : "Create category"}
              </button>

              {/* Cancel link when editing */}
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    fontSize: 12.5,
                    color: "#7C7268",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                    fontWeight: 500,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    textAlign: "center",
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,21,18,.4)",
            }}
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            style={{
              position: "relative",
              background: "#fff",
              border: "1px solid #E7E1D7",
              borderRadius: 2,
              padding: "24px 28px",
              maxWidth: 380,
              width: "100%",
              zIndex: 1,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 650,
                color: "#1A1512",
                margin: "0 0 8px",
              }}
            >
              Delete category
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#4A4139",
                lineHeight: 1.55,
                margin: "0 0 20px",
              }}
            >
              Are you sure you want to delete &ldquo;{deleteConfirm.name}
              &rdquo;? Products in this category will become uncategorized.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 550,
                  color: "#4A4139",
                  background: "none",
                  border: "1px solid #E7E1D7",
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 650,
                  color: "#fff",
                  background: "#B4551F",
                  border: "none",
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
