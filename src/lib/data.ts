import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/types";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("is_available", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map(mapProduct);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return mapProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    image_url: c.image_url || "",
  }));
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string
): Promise<Product[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("is_available", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(3);

  if (error || !data) return [];

  return data.map(mapProduct);
}

export async function getPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").maybeSingle();
  return data as {
    site_name: string;
    tagline: string;
    whatsapp_number: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    social_links: { instagram?: string; facebook?: string };
  } | null;
}

// Map DB row to Product type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    origin: row.origin || "",
    category: row.categories?.slug || "",
    category_id: row.category_id || null,
    image_url: row.image_url || "",
    images: row.images || [],
    weights: row.weights || [],
    nutrition: row.nutrition || {
      serving_size: "",
      calories: 0,
      protein: "0g",
      fat: "0g",
      carbs: "0g",
      fiber: "0g",
    },
    tags: row.tags || [],
    is_featured: row.is_featured,
    is_available: row.is_available,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
