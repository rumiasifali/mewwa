"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteImagesFromUrls } from "@/lib/supabase/storage";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
  ImagePlus,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  origin: string;
  category_id: string | null;
  image_url: string;
  images: string[];
  weights: { grams: number; label: string; price: number; currency: string }[];
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
  tags: string[];
  is_featured: boolean;
  is_available: boolean;
  categories?: Category;
}

const emptyProduct: Omit<Product, "id" | "categories"> = {
  name: "",
  slug: "",
  description: "",
  origin: "",
  category_id: null,
  image_url: "",
  images: [],
  weights: [{ grams: 250, label: "250g", price: 0, currency: "PKR" }],
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
  tags: [],
  is_featured: false,
  is_available: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [tagInput, setTagInput] = useState("");

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
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      origin: product.origin || "",
      category_id: product.category_id,
      image_url: product.image_url || "",
      images: product.images || [],
      weights: product.weights || [],
      nutrition: product.nutrition || emptyProduct.nutrition,
      storage_instructions: product.storage_instructions || "",
      shelf_life: product.shelf_life || "",
      shipping_info: product.shipping_info || "",
      tags: product.tags || [],
      is_featured: product.is_featured,
      is_available: product.is_available,
    });
    setDialogOpen(true);
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
        { grams: 500, label: "500g", price: 0, currency: "PKR" },
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
    value: string | number
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
    setDialogOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!editingProduct) return;

    // Delete all images associated with this product
    const imagesToDelete = [];
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
    fetchData();
  }


  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.origin?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl"
        />
      </div>

      {/* Product list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            {search ? "No products match your search." : "No products yet."}
          </p>
          <Button onClick={openCreate} variant="outline" className="mt-4 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add your first product
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:bg-accent/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl opacity-30">🥜</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">
                    {product.name}
                  </h3>
                  {product.is_featured && (
                    <Badge variant="secondary" className="text-[10px]">
                      Featured
                    </Badge>
                  )}
                  {!product.is_available && (
                    <Badge variant="destructive" className="text-[10px]">
                      Unavailable
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {product.origin} &middot;{" "}
                  {product.categories?.name || "Uncategorized"} &middot;{" "}
                  {product.weights?.length || 0} weight options
                </p>
              </div>

              {/* Price */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">
                  PKR {product.weights?.[0]?.price?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.weights?.[0]?.label || "—"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(product)}
                  className="rounded-lg"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(product);
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
          <div className="absolute inset-0 z-0 bg-black/40" onClick={() => setDialogOpen(false)} />
          <div className="absolute inset-y-0 right-0 z-10 w-full max-w-2xl bg-background shadow-xl overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    {editingProduct ? "Edit Product" : "New Product"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingProduct
                      ? "Update product details below."
                      : "Fill in the product details below."}
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

          <form onSubmit={handleSave} className="space-y-6">
            {/* Name + Slug */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
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
                  placeholder="Afghan Mamra Almonds"
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
                  placeholder="afghan-mamra-almonds"
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe the product..."
                rows={3}
                className="rounded-lg resize-none"
              />
            </div>

            {/* Origin + Category */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origin</Label>
                <Input
                  value={form.origin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, origin: e.target.value }))
                  }
                  placeholder="Afghanistan"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={form.category_id || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category_id: e.target.value || null,
                    }))
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
              />
            </div>

            {/* Weights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Weight & Pricing</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWeight}
                  className="rounded-lg text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              {form.weights.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={w.grams}
                    onChange={(e) =>
                      updateWeight(i, "grams", parseInt(e.target.value) || 0)
                    }
                    placeholder="Grams"
                    className="w-20 rounded-lg"
                  />
                  <Input
                    value={w.label}
                    onChange={(e) => updateWeight(i, "label", e.target.value)}
                    placeholder="Label"
                    className="w-24 rounded-lg"
                  />
                  <Input
                    type="number"
                    value={w.price}
                    onChange={(e) =>
                      updateWeight(i, "price", parseInt(e.target.value) || 0)
                    }
                    placeholder="Price (PKR)"
                    className="flex-1 rounded-lg"
                  />
                  {form.weights.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWeight(i)}
                      className="text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, is_featured: v }))
                  }
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_available}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, is_available: v }))
                  }
                />
                <Label>Available</Label>
              </div>
            </div>

            {/* Product Info Tabs */}
            <Tabs defaultValue="nutrition" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary h-11">
                <TabsTrigger value="nutrition" className="rounded-lg">
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="storage" className="rounded-lg">
                  Storage
                </TabsTrigger>
                <TabsTrigger value="shipping" className="rounded-lg">
                  Shipping
                </TabsTrigger>
              </TabsList>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Serving Size</Label>
                  <Input
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
                    className="rounded-lg"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calories (kcal)</Label>
                    <Input
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
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Protein</Label>
                    <Input
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
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fat</Label>
                    <Input
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
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Carbs</Label>
                    <Input
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
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fiber</Label>
                  <Input
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
                    className="rounded-lg"
                  />
                </div>
              </TabsContent>

              {/* Storage Tab */}
              <TabsContent value="storage" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Storage Instructions</Label>
                  <Textarea
                    value={form.storage_instructions || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, storage_instructions: e.target.value }))
                    }
                    placeholder="Store in a cool, dry place away from moisture and sunlight..."
                    rows={4}
                    className="rounded-lg resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shelf Life</Label>
                  <Input
                    value={form.shelf_life || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, shelf_life: e.target.value }))
                    }
                    placeholder="12 months from packaging date"
                    className="rounded-lg"
                  />
                </div>
              </TabsContent>

              {/* Shipping Tab */}
              <TabsContent value="shipping" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Shipping Info</Label>
                  <Textarea
                    value={form.shipping_info || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, shipping_info: e.target.value }))
                    }
                    placeholder="Packed in food-grade packaging. Ships within 2 business days..."
                    rows={4}
                    className="rounded-lg resize-none"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit */}
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
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingProduct ? "Update Product" : "Create Product"}
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
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{editingProduct?.name}
              &rdquo;? This action cannot be undone.
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
