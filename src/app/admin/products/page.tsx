"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteImagesFromUrls } from "@/lib/supabase/storage";
import { Loader2, Pencil, Trash2, Search, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface WeightEntry {
  grams: number;
  label: string;
  price: number;
  currency: string;
  live?: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  origin: string;
  grade?: string;
  category_id: string | null;
  image_url: string;
  images: string[];
  weights: WeightEntry[];
  nutrition: {
    serving_size: string;
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
    fiber: string;
  } | null;
  storage_instructions?: string;
  shelf_life?: string;
  shipping_info?: string;
  lab_report_url?: string;
  tags: string[];
  is_featured: boolean;
  is_available: boolean;
  is_lab_tested?: boolean;
  stock?: number;
  categories?: Category;
}

const emptyProduct: Omit<Product, "id" | "categories"> = {
  name: "",
  slug: "",
  description: "",
  origin: "",
  grade: "",
  category_id: null,
  image_url: "",
  images: [],
  weights: [{ grams: 250, label: "250g", price: 0, currency: "PKR", live: true }],
  nutrition: {
    serving_size: "30g",
    calories: 0,
    protein: "0g",
    fat: "0g",
    carbs: "0g",
    fiber: "0g",
  },
  storage_instructions: "",
  shelf_life: "",
  shipping_info: "",
  lab_report_url: "",
  tags: [],
  is_featured: false,
  is_available: true,
  is_lab_tested: false,
  stock: 0,
};

/* ─── Design Tokens ─── */
const T = {
  ink: "#1A1512",
  gold: "#C8922E",
  line: "#E7E1D7",
  line2: "#F0EBE3",
  muted: "#7C7268",
  muted2: "#9A9086",
  body: "#4A4139",
  faint: "#B0A69A",
  warn: "#B4551F",
  okColor: "#2E5A22",
  okBg: "#E6EFE0",
  warnBg: "#F7EBDA",
  headerBg: "#FBF9F5",
  inputBorder: "#DCD3C5",
  thumbBg: "#EDE7DC",
  thumbBorder: "#E0D8CA",
  dashedBorder: "#C4BAAC",
  dropzoneBg: "#F5F1EA",
};

/* ─── Shared inline style helpers ─── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  fontSize: 13.5,
  color: T.ink,
  border: `1px solid ${T.inputBorder}`,
  borderRadius: 2,
  outline: "none",
  fontFamily: "Geist, sans-serif",
  background: "#fff",
  transition: "border-color .15s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: T.body,
  marginBottom: 7,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: T.ink,
  margin: 0,
};

const thStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: T.muted2,
};

const cardStyle: React.CSSProperties = {
  border: `1px solid ${T.line}`,
  background: "#fff",
  padding: 22,
};

const monoFont = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace";

const gridCols = "26px 34px 1.8fr 1fr .7fr .6fr auto";

const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239A9086' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = T.gold;
}
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = T.inputBorder;
}

/* ─── Toggle component ─── */
function Toggle({
  on,
  onToggle,
  size = "md",
}: {
  on: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const w = size === "sm" ? 26 : 30;
  const h = size === "sm" ? 15 : 17;
  const r = size === "sm" ? 8 : 9;
  const knob = size === "sm" ? 11 : 13;
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        border: "none",
        background: on ? T.ink : T.inputBorder,
        cursor: "pointer",
        position: "relative",
        transition: "background .2s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: knob,
          height: knob,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: on ? w - knob - 2 : 2,
          transition: "left .2s",
        }}
      />
    </button>
  );
}

/* ─── Category dropdown component ─── */
function CategoryDropdown({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          height: 40,
          padding: "0 12px",
          border: `1px solid ${T.inputBorder}`,
          borderRadius: 2,
          fontSize: 13.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          background: "#fff",
          color: selected ? T.ink : T.faint,
        }}
      >
        <span>{selected ? selected.name : "Select category"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.4">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1px solid ${T.inputBorder}`,
            borderRadius: 2,
            zIndex: 20,
            maxHeight: 200,
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          <div
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            style={{
              padding: "8px 12px",
              fontSize: 13,
              color: T.faint,
              cursor: "pointer",
            }}
          >
            None
          </div>
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                color: T.ink,
                cursor: "pointer",
                background: c.id === value ? T.line2 : "transparent",
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Origin dropdown component ─── */
function OriginDropdown({
  origins,
  value,
  onChange,
}: {
  origins: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          height: 40,
          padding: "0 12px",
          border: `1px solid ${T.inputBorder}`,
          borderRadius: 2,
          fontSize: 13.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          background: "#fff",
          color: value ? T.ink : T.faint,
        }}
      >
        <span>{value || "Select origin"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.4">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: `1px solid ${T.inputBorder}`,
            borderRadius: 2,
            zIndex: 20,
            maxHeight: 200,
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          {origins.length === 0 && (
            <div style={{ padding: "8px 12px", fontSize: 12.5, color: T.faint }}>
              Type an origin in the field
            </div>
          )}
          {origins.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                color: T.ink,
                cursor: "pointer",
                background: o === value ? T.line2 : "transparent",
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [tagInput, setTagInput] = useState("");

  /* Filters */
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("available");
  const [filterSort, setFilterSort] = useState("manual");

  /* Bulk selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [productsRes, catsRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(id, name, slug)")
        .order("sort_order", { ascending: true }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyProduct);
    setTagInput("");
    setEditorOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      origin: product.origin || "",
      grade: (product as any).grade || "",
      category_id: product.category_id,
      image_url: product.image_url || "",
      images: product.images || [],
      weights: (product.weights || []).map((w) => ({ ...w, live: w.live !== false })),
      nutrition: product.nutrition || emptyProduct.nutrition,
      storage_instructions: product.storage_instructions || "",
      shelf_life: product.shelf_life || "",
      shipping_info: product.shipping_info || "",
      lab_report_url: (product as any).lab_report_url || "",
      tags: product.tags || [],
      is_featured: product.is_featured,
      is_available: product.is_available,
      is_lab_tested: (product as any).is_lab_tested || false,
      stock: (product as any).stock || 0,
    });
    setTagInput("");
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingProduct(null);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function addWeight() {
    setForm((f) => ({
      ...f,
      weights: [
        ...f.weights,
        { grams: 500, label: "500g", price: 0, currency: "PKR", live: true },
      ],
    }));
  }

  function removeWeight(index: number) {
    setForm((f) => ({
      ...f,
      weights: f.weights.filter((_, i) => i !== index),
    }));
  }

  function updateWeight(
    index: number,
    field: string,
    value: string | number | boolean
  ) {
    setForm((f) => ({
      ...f,
      weights: f.weights.map((w, i) =>
        i === index ? { ...w, [field]: value } : w
      ),
    }));
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...form,
      slug: form.slug || generateSlug(form.name),
    };

    // If updating and main image changed, delete old image
    if (editingProduct && editingProduct.image_url !== form.image_url) {
      if (editingProduct.image_url) {
        await deleteImagesFromUrls([editingProduct.image_url]);
      }
    }

    // Delete any gallery images that were removed
    if (editingProduct && editingProduct.images?.length > 0) {
      const removedImages = editingProduct.images.filter(
        (img) => !form.images.includes(img)
      );
      if (removedImages.length > 0) {
        await deleteImagesFromUrls(removedImages);
      }
    }

    if (editingProduct) {
      await supabase
        .from("products")
        .update(data)
        .eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert(data);
    }

    setSaving(false);
    setEditorOpen(false);
    setEditingProduct(null);
    fetchData();
  }

  async function handleDelete() {
    if (!editingProduct) return;

    // Delete all images associated with this product
    const imagesToDelete: string[] = [];
    if (editingProduct.image_url) imagesToDelete.push(editingProduct.image_url);
    if (editingProduct.images?.length > 0) {
      imagesToDelete.push(...editingProduct.images);
    }

    if (imagesToDelete.length > 0) {
      await deleteImagesFromUrls(imagesToDelete);
    }

    await supabase.from("products").delete().eq("id", editingProduct.id);
    setDeleteDialogOpen(false);
    setEditingProduct(null);
    setEditorOpen(false);
    fetchData();
  }

  async function toggleFeatured(product: Product) {
    await supabase
      .from("products")
      .update({ is_featured: !product.is_featured })
      .eq("id", product.id);
    fetchData();
  }

  async function bulkFeature() {
    const ids = Array.from(selected);
    for (let i = 0; i < ids.length; i++) {
      await supabase.from("products").update({ is_featured: true }).eq("id", ids[i]);
    }
    setSelected(new Set());
    fetchData();
  }

  async function bulkUnlist() {
    const ids = Array.from(selected);
    for (let i = 0; i < ids.length; i++) {
      await supabase.from("products").update({ is_available: false }).eq("id", ids[i]);
    }
    setSelected(new Set());
    fetchData();
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    const toDelete = products.filter((p) => selected.has(p.id));
    const allImages: string[] = [];
    for (const p of toDelete) {
      if (p.image_url) allImages.push(p.image_url);
      if (p.images?.length > 0) allImages.push(...p.images);
    }
    if (allImages.length > 0) {
      await deleteImagesFromUrls(allImages);
    }
    for (let i = 0; i < ids.length; i++) {
      await supabase.from("products").delete().eq("id", ids[i]);
    }
    setSelected(new Set());
    fetchData();
  }

  /* Filtering */
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.origin?.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q));
    const matchesCat = !filterCategory || p.category_id === filterCategory;
    const matchesOrigin = !filterOrigin || p.origin === filterOrigin;
    const matchesAvail =
      !filterAvailability ||
      (filterAvailability === "available" ? p.is_available : !p.is_available);
    return matchesSearch && matchesCat && matchesOrigin && matchesAvail;
  });

  /* Derive unique origins for dropdown */
  const uniqueOrigins = Array.from(new Set(products.map((p) => p.origin).filter(Boolean))).sort();

  /* Count live products */
  const liveCount = products.filter((p) => p.is_available).length;

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ─── Select dropdown style ─── */
  const selectStyle: React.CSSProperties = {
    height: 34,
    padding: "0 28px 0 10px",
    fontSize: 12.5,
    color: T.body,
    border: `1px solid ${T.inputBorder}`,
    borderRadius: 2,
    background: "#fff",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: chevronBg,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  /* ─── Checkbox style ─── */
  const checkboxStyle: React.CSSProperties = {
    width: 13,
    height: 13,
    cursor: "pointer",
    accentColor: T.ink,
    margin: 0,
  };

  /* ─── Compute preview data ─── */
  const previewOrigin = form.origin || "Origin";
  const previewName = form.name || "Product name";
  const previewPrice =
    form.weights.length > 0 && form.weights[0].price > 0
      ? `PKR ${form.weights[0].price.toLocaleString()}`
      : "PKR 0";
  const previewUnit =
    form.weights.length > 0 && form.weights[0].label
      ? form.weights[0].label
      : "250g";

  /* ════════════════════════════════════════════════════════════ */
  /* ──── EDITOR VIEW ──── */
  /* ════════════════════════════════════════════════════════════ */
  if (editorOpen) {
    return (
      <div>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
            color: T.muted,
          }}
        >
          <span onClick={closeEditor} style={{ cursor: "pointer" }}>
            Products
          </span>
          <span>/</span>
          <span style={{ color: T.ink, fontWeight: 500 }}>
            {editingProduct ? editingProduct.name : "New product"}
          </span>
        </div>

        {/* Header row */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-.035em",
              color: T.ink,
            }}
          >
            {editingProduct ? "Edit product" : "Add a product"}
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={closeEditor}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 38,
                padding: "0 16px",
                border: `1px solid ${T.inputBorder}`,
                background: "#fff",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 2,
                cursor: "pointer",
                fontFamily: "inherit",
                color: T.ink,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSave(fakeEvent);
              }}
              disabled={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 38,
                padding: "0 16px",
                border: `1px solid ${T.inputBorder}`,
                background: "#fff",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 2,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                color: T.ink,
              }}
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={(e) => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSave(fakeEvent);
              }}
              disabled={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 38,
                padding: "0 18px",
                background: saving ? T.muted2 : T.ink,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                borderRadius: 2,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {saving && (
                <Loader2
                  className="animate-spin"
                  style={{ width: 14, height: 14 }}
                />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Two-column grid */}
        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "1fr 316px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ═══ LEFT COLUMN ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* ── Card 1: BASICS ── */}
            <div style={cardStyle}>
              <div style={eyebrowStyle}>Basics</div>
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* Name + Slug */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          name: e.target.value,
                          slug: editingProduct
                            ? f.slug
                            : generateSlug(e.target.value),
                        }));
                      }}
                      placeholder="Mamra Almonds"
                      required
                      style={inputStyle}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: e.target.value }))
                      }
                      placeholder="mamra-almonds"
                      style={{
                        ...inputStyle,
                        fontFamily: monoFont,
                        color: T.muted,
                      }}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="What it is, how it tastes, why this lot."
                    rows={4}
                    style={{
                      ...inputStyle,
                      height: "auto",
                      padding: "11px 12px",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>

                {/* Category / Origin / Grade */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Category</label>
                    <CategoryDropdown
                      categories={categories}
                      value={form.category_id}
                      onChange={(id) =>
                        setForm((f) => ({ ...f, category_id: id }))
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Origin</label>
                    <OriginDropdown
                      origins={uniqueOrigins}
                      value={form.origin}
                      onChange={(v) => setForm((f) => ({ ...f, origin: v }))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Grade</label>
                    <input
                      type="text"
                      value={form.grade || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, grade: e.target.value }))
                      }
                      placeholder="Grade A"
                      style={inputStyle}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={labelStyle}>Tags</label>
                  <div
                    style={{
                      minHeight: 40,
                      padding: "6px 8px",
                      border: `1px solid ${T.inputBorder}`,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                      background: "#fff",
                    }}
                  >
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: T.ink,
                          color: "#fff",
                          fontSize: 11.5,
                          fontWeight: 500,
                          padding: "4px 8px",
                          borderRadius: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                        >
                          <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder={form.tags.length === 0 ? "Add a tag..." : ""}
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: 12.5,
                        color: T.ink,
                        background: "transparent",
                        flex: 1,
                        minWidth: 80,
                        padding: 0,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 2: WEIGHTS & PRICING ── */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={eyebrowStyle}>Weights &amp; pricing</div>
                <span style={{ fontSize: 11.5, color: T.muted2 }}>
                  Stored as{" "}
                  <span style={{ fontFamily: monoFont }}>weights</span> jsonb
                </span>
              </div>

              {/* Column headers */}
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr 1fr 70px 30px",
                  gap: 10,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${T.line2}`,
                }}
              >
                <span style={thStyle}>Grams</span>
                <span style={thStyle}>Label</span>
                <span style={thStyle}>Price (PKR)</span>
                <span style={thStyle}>Per KG</span>
                <span style={thStyle}>Live</span>
                <span />
              </div>

              {/* Weight rows */}
              {form.weights.map((w, i) => {
                const perKg =
                  w.grams > 0
                    ? Math.round((w.price / w.grams) * 1000)
                    : 0;
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 1fr 1fr 70px 30px",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: `1px solid ${T.line2}`,
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="number"
                      value={w.grams}
                      onChange={(e) =>
                        updateWeight(i, "grams", parseInt(e.target.value) || 0)
                      }
                      style={{
                        ...inputStyle,
                        height: 34,
                        fontSize: 13,
                        padding: "0 10px",
                      }}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                    <input
                      type="text"
                      value={w.label}
                      onChange={(e) => updateWeight(i, "label", e.target.value)}
                      style={{
                        ...inputStyle,
                        height: 34,
                        fontSize: 13,
                        padding: "0 10px",
                      }}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                    <input
                      type="number"
                      value={w.price}
                      onChange={(e) =>
                        updateWeight(i, "price", parseInt(e.target.value) || 0)
                      }
                      style={{
                        ...inputStyle,
                        height: 34,
                        fontSize: 13,
                        padding: "0 10px",
                      }}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                    <span style={{ fontSize: 12.5, color: T.muted }}>
                      {perKg > 0
                        ? `PKR ${perKg.toLocaleString()}`
                        : "--"}
                    </span>
                    <Toggle
                      on={w.live !== false}
                      onToggle={() => updateWeight(i, "live", !(w.live !== false))}
                      size="sm"
                    />
                    {form.weights.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeWeight(i)}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={T.warn}
                          strokeWidth="2"
                        >
                          <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />
                        </svg>
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}

              {/* Add a weight button */}
              <button
                type="button"
                onClick={addWeight}
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 34,
                  padding: "0 12px",
                  border: `1px dashed ${T.dashedBorder}`,
                  background: "transparent",
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: T.ink,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.ink}
                  strokeWidth="2.6"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add a weight
              </button>
            </div>

            {/* ── Card 3: NUTRITION & CARE ── */}
            <div style={cardStyle}>
              <div style={eyebrowStyle}>Nutrition &amp; care</div>

              {/* 6 nutrition fields in 3-col grid */}
              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Serving size</label>
                  <input
                    type="text"
                    value={form.nutrition?.serving_size || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nutrition: {
                          serving_size: e.target.value,
                          calories: f.nutrition?.calories || 0,
                          protein: f.nutrition?.protein || "0g",
                          fat: f.nutrition?.fat || "0g",
                          carbs: f.nutrition?.carbs || "0g",
                          fiber: f.nutrition?.fiber || "0g",
                        },
                      }))
                    }
                    placeholder="30g"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Calories</label>
                  <input
                    type="number"
                    value={form.nutrition?.calories || 0}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nutrition: {
                          serving_size: f.nutrition?.serving_size || "30g",
                          calories: parseInt(e.target.value) || 0,
                          protein: f.nutrition?.protein || "0g",
                          fat: f.nutrition?.fat || "0g",
                          carbs: f.nutrition?.carbs || "0g",
                          fiber: f.nutrition?.fiber || "0g",
                        },
                      }))
                    }
                    placeholder="0"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Protein</label>
                  <input
                    type="text"
                    value={form.nutrition?.protein || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nutrition: {
                          serving_size: f.nutrition?.serving_size || "30g",
                          calories: f.nutrition?.calories || 0,
                          protein: e.target.value,
                          fat: f.nutrition?.fat || "0g",
                          carbs: f.nutrition?.carbs || "0g",
                          fiber: f.nutrition?.fiber || "0g",
                        },
                      }))
                    }
                    placeholder="0g"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fat</label>
                  <input
                    type="text"
                    value={form.nutrition?.fat || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nutrition: {
                          serving_size: f.nutrition?.serving_size || "30g",
                          calories: f.nutrition?.calories || 0,
                          protein: f.nutrition?.protein || "0g",
                          fat: e.target.value,
                          carbs: f.nutrition?.carbs || "0g",
                          fiber: f.nutrition?.fiber || "0g",
                        },
                      }))
                    }
                    placeholder="0g"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Carbs</label>
                  <input
                    type="text"
                    value={form.nutrition?.carbs || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nutrition: {
                          serving_size: f.nutrition?.serving_size || "30g",
                          calories: f.nutrition?.calories || 0,
                          protein: f.nutrition?.protein || "0g",
                          fat: f.nutrition?.fat || "0g",
                          carbs: e.target.value,
                          fiber: f.nutrition?.fiber || "0g",
                        },
                      }))
                    }
                    placeholder="0g"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fiber</label>
                  <input
                    type="text"
                    value={form.nutrition?.fiber || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nutrition: {
                          serving_size: f.nutrition?.serving_size || "30g",
                          calories: f.nutrition?.calories || 0,
                          protein: f.nutrition?.protein || "0g",
                          fat: f.nutrition?.fat || "0g",
                          carbs: f.nutrition?.carbs || "0g",
                          fiber: e.target.value,
                        },
                      }))
                    }
                    placeholder="0g"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
              </div>

              {/* Storage instructions + Shelf life / Lab report */}
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Storage instructions</label>
                  <textarea
                    value={form.storage_instructions || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        storage_instructions: e.target.value,
                      }))
                    }
                    placeholder="Cool, dry, out of sunlight..."
                    rows={3}
                    style={{
                      ...inputStyle,
                      height: "auto",
                      padding: "10px 12px",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Shelf life</label>
                  <input
                    type="text"
                    value={form.shelf_life || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, shelf_life: e.target.value }))
                    }
                    placeholder="6 months from pack date"
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                  <label
                    style={{
                      ...labelStyle,
                      marginTop: 14,
                    }}
                  >
                    Lab report URL
                  </label>
                  <input
                    type="text"
                    value={form.lab_report_url || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lab_report_url: e.target.value }))
                    }
                    placeholder="https://..."
                    style={{ ...inputStyle, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "sticky",
              top: 116,
            }}
          >
            {/* ── Right Card 1: STATUS ── */}
            <div style={{ ...cardStyle, padding: 20 }}>
              <div style={eyebrowStyle}>Status</div>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 13,
                }}
              >
                {/* Available toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Available</div>
                    <div style={{ fontSize: 11, color: T.muted2, marginTop: 1 }}>
                      Visible on storefront
                    </div>
                  </div>
                  <Toggle
                    on={form.is_available}
                    onToggle={() =>
                      setForm((f) => ({ ...f, is_available: !f.is_available }))
                    }
                  />
                </div>

                {/* Featured toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Featured</div>
                    <div style={{ fontSize: 11, color: T.muted2, marginTop: 1 }}>
                      Shown on homepage
                    </div>
                  </div>
                  <Toggle
                    on={form.is_featured}
                    onToggle={() =>
                      setForm((f) => ({ ...f, is_featured: !f.is_featured }))
                    }
                  />
                </div>

                {/* Lab tested toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Lab tested</div>
                    <div style={{ fontSize: 11, color: T.muted2, marginTop: 1 }}>
                      Show badge on product
                    </div>
                  </div>
                  <Toggle
                    on={form.is_lab_tested || false}
                    onToggle={() =>
                      setForm((f) => ({
                        ...f,
                        is_lab_tested: !f.is_lab_tested,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Stock on hand */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${T.line2}`,
                }}
              >
                <label style={labelStyle}>Stock on hand</label>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="number"
                    value={form.stock || 0}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock: parseInt(e.target.value) || 0,
                      }))
                    }
                    style={{ ...inputStyle, flex: 1, height: 38 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                  <span style={{ fontSize: 12.5, color: T.muted }}>kg</span>
                </div>
              </div>
            </div>

            {/* ── Right Card 2: IMAGES ── */}
            <div style={{ ...cardStyle, padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={eyebrowStyle}>Images</div>
                <span style={{ fontSize: 11, color: T.muted2 }}>
                  Supabase storage
                </span>
              </div>

              {/* Primary image */}
              <div
                style={{
                  marginTop: 14,
                  aspectRatio: "1",
                  overflow: "hidden",
                  background: T.dropzoneBg,
                  border: `1px dashed ${T.dashedBorder}`,
                }}
              >
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) =>
                    setForm((f) => ({ ...f, image_url: url }))
                  }
                />
              </div>

              {/* Gallery: 3 slots */}
              <div
                style={{
                  marginTop: 8,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}
              >
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: "1",
                      overflow: "hidden",
                      background: T.dropzoneBg,
                      border: `1px dashed ${T.dashedBorder}`,
                    }}
                  >
                    <ImageUpload
                      value={form.images[idx] || ""}
                      onChange={(url) => {
                        setForm((f) => {
                          const newImages = [...f.images];
                          if (url) {
                            newImages[idx] = url;
                          } else {
                            newImages.splice(idx, 1);
                          }
                          return { ...f, images: newImages };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: T.muted2,
                }}
              >
                First image becomes{" "}
                <span style={{ fontFamily: monoFont }}>image_url</span>; the
                rest fill{" "}
                <span style={{ fontFamily: monoFont }}>images[]</span>.
              </p>
            </div>

            {/* ── Right Card 3: STOREFRONT PREVIEW ── */}
            <div style={{ ...cardStyle, padding: 20 }}>
              <div style={eyebrowStyle}>Storefront preview</div>
              <div
                style={{
                  marginTop: 14,
                  border: `1px solid ${T.line}`,
                  padding: 12,
                }}
              >
                {/* Image placeholder */}
                <div
                  style={{
                    aspectRatio: "1",
                    background: T.line2,
                    overflow: "hidden",
                  }}
                >
                  {form.image_url && (
                    <img
                      src={form.image_url}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: T.muted,
                    fontWeight: 600,
                    marginTop: 10,
                  }}
                >
                  {previewOrigin}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 650,
                    marginTop: 4,
                    color: T.ink,
                  }}
                >
                  {previewName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: T.ink }}>
                  {previewPrice}
                  <span
                    style={{
                      fontSize: 10.5,
                      color: T.muted,
                      fontWeight: 400,
                    }}
                  >
                    {" "}
                    / {previewUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Delete button (only for editing) ── */}
        {editingProduct && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line2}` }}>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              style={{
                height: 38,
                padding: "0 16px",
                fontSize: 13,
                fontWeight: 600,
                color: T.warn,
                background: "#fff",
                border: `1px solid ${T.inputBorder}`,
                borderRadius: 2,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Delete product
            </button>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deleteDialogOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
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
              onClick={() => setDeleteDialogOpen(false)}
            />
            <div
              style={{
                position: "relative",
                background: "#fff",
                border: `1px solid ${T.line}`,
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
                  color: T.ink,
                  margin: "0 0 8px",
                }}
              >
                Delete product
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: T.body,
                  lineHeight: 1.55,
                  margin: "0 0 20px",
                }}
              >
                Are you sure you want to delete &ldquo;{editingProduct?.name}
                &rdquo;? This action cannot be undone.
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
                  onClick={() => setDeleteDialogOpen(false)}
                  style={{
                    height: 38,
                    padding: "0 18px",
                    fontSize: 13,
                    fontWeight: 550,
                    color: T.body,
                    background: "none",
                    border: `1px solid ${T.line}`,
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
                    height: 38,
                    padding: "0 18px",
                    fontSize: 13,
                    fontWeight: 650,
                    color: "#fff",
                    background: T.warn,
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

  /* ════════════════════════════════════════════════════════════ */
  /* ──── LIST VIEW ──── */
  /* ════════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ──── Page Header ──── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-.035em",
              color: T.ink,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Products
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: T.muted,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {liveCount} live{" "}
            <span style={{ color: T.muted }}>· pulled from </span>
            <code
              style={{
                fontFamily: monoFont,
                fontSize: 12.5,
                background: T.line2,
                padding: "2px 6px",
                borderRadius: 2,
                color: T.muted,
              }}
            >
              products
            </code>
            <span style={{ color: T.muted }}> ordered by sort_order</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 38,
              padding: "0 18px",
              fontSize: 13,
              fontWeight: 600,
              color: T.body,
              background: "#fff",
              border: `1px solid ${T.inputBorder}`,
              borderRadius: 2,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={openCreate}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 38,
              padding: "0 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: T.ink,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New product
          </button>
        </div>
      </div>

      {/* ──── Search + Filters ──── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
          <Search
            style={{
              position: "absolute",
              left: 9,
              top: "50%",
              transform: "translateY(-50%)",
              width: 15,
              height: 15,
              color: T.faint,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search name, origin or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: 34,
              paddingLeft: 30,
              paddingRight: 10,
              fontSize: 13,
              color: T.ink,
              border: `1px solid ${T.inputBorder}`,
              borderRadius: 2,
              outline: "none",
              fontFamily: "inherit",
              background: "#fff",
              transition: "border-color .15s",
              boxSizing: "border-box",
            }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={selectStyle}
        >
          <option value="">Category All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Origin filter */}
        <select
          value={filterOrigin}
          onChange={(e) => setFilterOrigin(e.target.value)}
          style={selectStyle}
        >
          <option value="">Origin All</option>
          {uniqueOrigins.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterAvailability}
          onChange={(e) => setFilterAvailability(e.target.value)}
          style={selectStyle}
        >
          <option value="">Status All</option>
          <option value="available">Live</option>
          <option value="unavailable">Unlisted</option>
        </select>

        {/* Sort filter */}
        <select
          value={filterSort}
          onChange={(e) => setFilterSort(e.target.value)}
          style={selectStyle}
        >
          <option value="manual">Sort Manual</option>
          <option value="name">Sort A-Z</option>
          <option value="price">Sort Price</option>
        </select>
      </div>

      {/* ──── Bulk action bar ──── */}
      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 16px",
            marginBottom: 12,
            background: T.line2,
            border: `1px solid ${T.line}`,
            borderRadius: 2,
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: T.body,
            }}
          >
            {selected.size} selected
          </span>
          <span style={{ color: T.line, fontSize: 12 }}>·</span>
          <button
            type="button"
            onClick={bulkFeature}
            style={{
              padding: 0,
              fontSize: 12.5,
              fontWeight: 700,
              color: T.ink,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Feature
          </button>
          <span style={{ color: T.line, fontSize: 12 }}>·</span>
          <button
            type="button"
            onClick={bulkUnlist}
            style={{
              padding: 0,
              fontSize: 12.5,
              fontWeight: 700,
              color: T.ink,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Unlist
          </button>
          <span style={{ color: T.line, fontSize: 12 }}>·</span>
          <button
            type="button"
            onClick={bulkDelete}
            style={{
              padding: 0,
              fontSize: 12.5,
              fontWeight: 700,
              color: T.warn,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* ──── Product Table ──── */}
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
            style={{ width: 22, height: 22, color: T.muted2 }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            color: T.muted2,
            fontSize: 13.5,
          }}
        >
          {search || filterCategory || filterOrigin || filterAvailability
            ? "No products match your filters."
            : "No products yet."}
          {!search && !filterCategory && !filterOrigin && !filterAvailability && (
            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={openCreate}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 38,
                  padding: "0 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.body,
                  background: "#fff",
                  border: `1px solid ${T.inputBorder}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
                Add your first product
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${T.line}`,
            borderRadius: 2,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              background: T.headerBg,
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            {/* Checkbox */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                style={checkboxStyle}
              />
            </div>
            {/* Thumbnail spacer */}
            <span />
            <span style={thStyle}>Product</span>
            <span style={thStyle}>Origin</span>
            <span style={thStyle}>From</span>
            <span style={thStyle}>Stock</span>
            <span />
          </div>

          {/* Table rows */}
          {filtered.map((product) => {
            const lowestPrice = product.weights?.length
              ? Math.min(...product.weights.map((w) => w.price))
              : null;
            const weightCount = product.weights?.length || 0;
            const isLowStock = weightCount <= 1;

            return (
              <div
                key={product.id}
                className="qaaq-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  borderBottom: `1px solid ${T.line2}`,
                  cursor: "default",
                  transition: "background .12s",
                }}
              >
                {/* Checkbox */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    style={checkboxStyle}
                  />
                </div>

                {/* Thumbnail */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    overflow: "hidden",
                    background: T.thumbBg,
                    border: `1px solid ${T.thumbBorder}`,
                    flexShrink: 0,
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
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
                        color: T.faint,
                        fontSize: 11,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
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

                {/* Product: name + slug */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: T.ink,
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.name}
                    {!product.is_available && (
                      <span
                        style={{
                          display: "inline-block",
                          marginLeft: 8,
                          fontSize: 10,
                          fontWeight: 600,
                          color: T.warn,
                          background: T.warnBg,
                          padding: "2px 6px",
                          borderRadius: 2,
                          verticalAlign: "middle",
                          letterSpacing: ".04em",
                          textTransform: "uppercase",
                        }}
                      >
                        Unlisted
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: monoFont,
                      color: T.faint,
                      marginTop: 2,
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.slug}
                  </div>
                </div>

                {/* Origin */}
                <div
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.origin || (
                    <span style={{ color: T.faint }}>--</span>
                  )}
                </div>

                {/* FROM price */}
                <div>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: T.ink,
                    }}
                  >
                    {lowestPrice != null
                      ? `PKR ${lowestPrice.toLocaleString()}`
                      : "--"}
                  </span>
                </div>

                {/* Stock (weight count) */}
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: isLowStock ? T.warn : T.body,
                    }}
                  >
                    {weightCount} SKU{weightCount !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Featured toggle + edit */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
                  {/* Featured toggle pill */}
                  <button
                    type="button"
                    onClick={() => toggleFeatured(product)}
                    style={{
                      width: 26,
                      height: 15,
                      borderRadius: 8,
                      border: "none",
                      background: product.is_featured ? T.ink : T.inputBorder,
                      cursor: "pointer",
                      position: "relative",
                      transition: "background .2s",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    title={product.is_featured ? "Remove from featured" : "Mark as featured"}
                  >
                    <div
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 2,
                        left: product.is_featured ? 13 : 2,
                        transition: "left .2s",
                      }}
                    />
                  </button>

                  {/* Edit pencil */}
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    style={{
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "none",
                      border: "none",
                      borderRadius: 2,
                      cursor: "pointer",
                      color: T.muted,
                      transition: "color .12s, background .12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = T.ink;
                      e.currentTarget.style.background = T.line2;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = T.muted;
                      e.currentTarget.style.background = "none";
                    }}
                    title="Edit product"
                  >
                    <Pencil style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderTop: `1px solid ${T.line2}`,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: T.muted,
              }}
            >
              Showing all {filtered.length}{" "}
              <span style={{ color: T.faint }}>· keyset paginated on sort_order</span>
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                disabled
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: `1px solid ${T.line}`,
                  borderRadius: 2,
                  cursor: "default",
                  color: T.faint,
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <button
                type="button"
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: T.ink,
                  border: "none",
                  borderRadius: 2,
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                1
              </button>
              <button
                type="button"
                disabled
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: `1px solid ${T.line}`,
                  borderRadius: 2,
                  cursor: "default",
                  color: T.faint,
                }}
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
