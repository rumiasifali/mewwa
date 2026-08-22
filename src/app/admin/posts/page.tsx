"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteImageFromUrl } from "@/lib/supabase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichEditor } from "@/components/admin/rich-editor";

/* ── Design tokens ── */
const C = {
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
  thumbBg: "#EDE7DC",
  thumbBorder: "#E0D8CA",
};

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    published: false,
  });

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    void load();
  }, [fetchData]);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      published: false,
    });
    setDialogOpen(true);
  }

  function openEdit(post: Post) {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      published: post.published,
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      slug: form.slug || generateSlug(form.title),
      // Only stamp published_at on the transition to published;
      // preserve the original timestamp for already-published posts.
      published_at: form.published
        ? editing?.published_at ?? new Date().toISOString()
        : null,
    };

    const { error } = editing
      ? await supabase.from("posts").update(data).eq("id", editing.id)
      : await supabase.from("posts").insert(data);

    setSaving(false);
    if (error) {
      toast.error(
        error.code === "23505"
          ? "A post with this slug already exists"
          : `Could not save post: ${error.message}`
      );
      return;
    }

    // If updating and cover image changed, delete old image
    if (editing && editing.cover_image !== form.cover_image && editing.cover_image) {
      await deleteImageFromUrl(editing.cover_image);
    }

    setDialogOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!editing) return;

    const { error } = await supabase.from("posts").delete().eq("id", editing.id);
    if (error) {
      toast.error(`Could not delete post: ${error.message}`);
      return;
    }

    // Delete cover image only after the row is gone
    if (editing.cover_image) {
      await deleteImageFromUrl(editing.cover_image);
    }

    setDeleteDialogOpen(false);
    setEditing(null);
    fetchData();
  }

  /* ── Helpers ── */
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* #15/#16 — Column header style: letterSpacing .14em, color #9A9086 */
  const colHead: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: C.muted2,
  };

  const gridCols = "56px 2fr .8fr .7fr .7fr .5fr";

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
          {/* #3 — letterSpacing -.035em */}
          <h1
            style={{
              fontSize: 27,
              fontWeight: 750,
              color: C.ink,
              letterSpacing: "-.035em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Journal
          </h1>
          {/* #4/#5 — marginTop 6, no letterSpacing */}
          <p
            style={{
              fontSize: 13.5,
              color: C.muted,
              marginTop: 6,
            }}
          >
            {publishedCount} published &middot; {draftCount} draft
            {draftCount !== 1 ? "s" : ""}. Only published posts are fetched by
            the storefront.
          </p>
        </div>
        {/* #6/#7/#8/#9/#10/#11/#12 — button fixes */}
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            height: 38,
            background: C.ink,
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Write a post
        </button>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <Loader2
            style={{
              width: 22,
              height: 22,
              color: C.faint,
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      ) : posts.length === 0 ? (
        /* #27 — Empty state: no borderRadius */
        <div
          style={{
            marginTop: 22,
            border: `1px solid ${C.line}`,
            background: "#fff",
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ color: C.muted2, fontSize: 13.5, margin: 0 }}>
            No posts yet. Start writing to build your journal.
          </p>
          <button
            onClick={openCreate}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: "transparent",
              border: `1px solid ${C.line}`,
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 600,
              color: C.body,
              cursor: "pointer",
              transition: "background .12s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = C.headerBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Plus style={{ width: 13, height: 13 }} />
            Write your first post
          </button>
        </div>
      ) : (
        /* #2/#26/#32 — Posts table: marginTop 22, no borderRadius, no overflow */
        <div
          style={{
            marginTop: 22,
            border: `1px solid ${C.line}`,
            background: "#fff",
          }}
        >
          {/* #13/#14 — Table header: borderBottom #F0EBE3, gap 14 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              alignItems: "center",
              gap: 14,
              padding: "10px 18px",
              background: C.headerBg,
              borderBottom: `1px solid ${C.line2}`,
            }}
          >
            <span />
            <span style={colHead}>Post</span>
            <span style={colHead}>Excerpt</span>
            <span style={colHead}>Date</span>
            <span style={colHead}>Status</span>
            <span />
          </div>

          {/* Table rows */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="qaaq-row"
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                alignItems: "center",
                gap: 14, /* #19 */
                padding: "11px 18px",
                borderBottom: `1px solid ${C.line2}`,
                cursor: "default",
              }}
            >
              {/* #17/#18 — Thumbnail: height 38, no borderRadius */}
              <div
                style={{
                  width: 56,
                  height: 38,
                  background: C.thumbBg,
                  border: `1px solid ${C.thumbBorder}`,
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  /* #31 — empty placeholder, no emoji */
                  <span />
                )}
              </div>

              {/* POST: title + slug */}
              <div style={{ minWidth: 0 }}>
                {/* #21 — fontWeight 600 */}
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: C.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.title}
                </div>
                {/* #22 — no marginTop */}
                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 11,
                    color: C.faint,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  /blog/{post.slug}
                </div>
              </div>

              {/* Excerpt */}
              <span
                style={{
                  fontSize: 12,
                  color: C.body,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {post.excerpt || "—"}
              </span>

              {/* Date */}
              <span
                style={{
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                {formatDate(post.created_at)}
              </span>

              {/* #24 — Status badge: no borderRadius */}
              <span
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  padding: "3px 7px",
                  color: post.published ? C.okColor : C.warn,
                  background: post.published ? C.okBg : C.warnBg,
                  alignSelf: "center",
                  justifySelf: "start",
                  width: "fit-content",
                }}
              >
                {post.published ? "Published" : "Draft"}
              </span>

              {/* #28 — Actions: no padding on buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifySelf: "end",
                }}
              >
                <span
                  onClick={() => openEdit(post)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                  }}
                  title="Edit post"
                >
                  <Pencil
                    style={{ width: 14, height: 14, color: C.muted }}
                  />
                </span>
                <span
                  onClick={() => {
                    setEditing(post);
                    setDeleteDialogOpen(true);
                  }}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                  }}
                  title="Delete post"
                >
                  <Trash2
                    style={{ width: 14, height: 14, color: C.warn }}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Slide Panel ── */}
      {dialogOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: "rgba(0,0,0,0.4)",
            }}
            onClick={() => setDialogOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              width: "100%",
              maxWidth: 680,
              background: "#fff",
              boxShadow: "-8px 0 32px rgba(0,0,0,.08)",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "28px 32px" }}>
              {/* Panel header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    {editing ? "Edit Post" : "New Post"}
                  </h2>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: C.muted,
                      marginTop: 3,
                    }}
                  >
                    {editing ? "Update your post." : "Create a new blog post."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: `1px solid ${C.line}`,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "background .12s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.headerBg)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <X style={{ width: 15, height: 15, color: C.muted }} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <Label
                      style={{
                        fontSize: 11,
                        fontWeight: 650,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: C.muted,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Title
                    </Label>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          title: e.target.value,
                          slug: editing
                            ? f.slug
                            : generateSlug(e.target.value),
                        }))
                      }
                      placeholder="Health Benefits of Almonds"
                      required
                      style={{
                        borderRadius: 2,
                        borderColor: C.line,
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div>
                    <Label
                      style={{
                        fontSize: 11,
                        fontWeight: 650,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: C.muted,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Slug
                    </Label>
                    <Input
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: e.target.value }))
                      }
                      style={{
                        borderRadius: 2,
                        borderColor: C.line,
                        fontSize: 13,
                        fontFamily: "ui-monospace, monospace",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Label
                    style={{
                      fontSize: 11,
                      fontWeight: 650,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: C.muted,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Cover Image
                  </Label>
                  <ImageUpload
                    value={form.cover_image}
                    onChange={(url) =>
                      setForm((f) => ({ ...f, cover_image: url }))
                    }
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Label
                    style={{
                      fontSize: 11,
                      fontWeight: 650,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: C.muted,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Excerpt
                  </Label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, excerpt: e.target.value }))
                    }
                    placeholder="Brief summary for SEO and previews..."
                    rows={2}
                    style={{
                      borderRadius: 2,
                      borderColor: C.line,
                      fontSize: 13,
                      resize: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Label
                    style={{
                      fontSize: 11,
                      fontWeight: 650,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: C.muted,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Content
                  </Label>
                  <RichEditor
                    value={form.content}
                    onChange={(html) =>
                      setForm((f) => ({ ...f, content: html }))
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  <Switch
                    checked={form.published}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, published: v }))
                    }
                  />
                  <Label
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: C.body,
                    }}
                  >
                    Publish
                  </Label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    paddingTop: 20,
                    borderTop: `1px solid ${C.line}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    style={{
                      padding: "8px 20px",
                      background: "transparent",
                      border: `1px solid ${C.line}`,
                      borderRadius: 2,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: C.body,
                      cursor: "pointer",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.headerBg)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "8px 22px",
                      background: C.ink,
                      color: "#fff",
                      border: "none",
                      borderRadius: 2,
                      fontSize: 12.5,
                      fontWeight: 650,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.6 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "opacity .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) e.currentTarget.style.opacity = "0.85";
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {saving && (
                      <Loader2
                        style={{
                          width: 14,
                          height: 14,
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    )}
                    {editing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent style={{ maxWidth: 380, borderRadius: 2 }}>
          <DialogHeader>
            <DialogTitle
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              Delete Post
            </DialogTitle>
            <DialogDescription
              style={{
                fontSize: 13,
                color: C.muted,
                marginTop: 4,
              }}
            >
              Are you sure you want to delete &ldquo;{editing?.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            <button
              onClick={() => setDeleteDialogOpen(false)}
              style={{
                padding: "7px 18px",
                background: "transparent",
                border: `1px solid ${C.line}`,
                borderRadius: 2,
                fontSize: 12.5,
                fontWeight: 600,
                color: C.body,
                cursor: "pointer",
                transition: "background .12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.headerBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "7px 18px",
                background: C.warn,
                color: "#fff",
                border: "none",
                borderRadius: 2,
                fontSize: 12.5,
                fontWeight: 650,
                cursor: "pointer",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
