"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichEditor } from "@/components/admin/rich-editor";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: boolean;
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
    fetchData();
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
      published_at: form.published ? new Date().toISOString() : null,
    };

    if (editing) {
      await supabase.from("posts").update(data).eq("id", editing.id);
    } else {
      await supabase.from("posts").insert(data);
    }

    setSaving(false);
    setDialogOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!editing) return;
    await supabase.from("posts").delete().eq("id", editing.id);
    setDeleteDialogOpen(false);
    setEditing(null);
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Blog content for SEO and engagement
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No posts yet.</p>
          <Button
            onClick={openCreate}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write your first post
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className="w-14 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg opacity-30">📝</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">
                    {post.title}
                  </h3>
                  <Badge
                    variant={post.published ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {post.excerpt || "No excerpt"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(post)}
                  className="rounded-lg"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(post);
                    setDeleteDialogOpen(true);
                  }}
                  className="rounded-lg text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Panel */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 z-0 bg-black/40"
            onClick={() => setDialogOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 z-10 w-full max-w-2xl bg-background shadow-xl overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    {editing ? "Edit Post" : "New Post"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editing ? "Update your post." : "Create a new blog post."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
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
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: e.target.value }))
                      }
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <ImageUpload
                    value={form.cover_image}
                    onChange={(url) =>
                      setForm((f) => ({ ...f, cover_image: url }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, excerpt: e.target.value }))
                    }
                    placeholder="Brief summary for SEO and previews..."
                    rows={2}
                    className="rounded-lg resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichEditor
                    value={form.content}
                    onChange={(html) =>
                      setForm((f) => ({ ...f, content: html }))
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.published}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, published: v }))
                    }
                  />
                  <Label>Publish</Label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="rounded-xl">
                    {saving && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    {editing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{editing?.title}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
