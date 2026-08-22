export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  origin: string;
  category: string;
  category_id: string | null;
  image_url: string;
  images: string[];
  weights: WeightOption[];
  nutrition: NutritionInfo;
  tags: string[];
  grade?: string | null;
  lab_report_url?: string | null;
  stock?: number | null;
  is_featured: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeightOption {
  grams: number;
  label: string;
  price: number;
  currency: string;
}

export interface NutritionInfo {
  serving_size: string;
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
  fiber: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  whatsapp_number: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  email: string;
  location: string;
  rating: number;
  content: string;
  product_id: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// ── Search ──

export type SearchResultType = "product" | "category" | "post";

export interface SearchResult {
  result_type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  image_url: string | null;
  url: string;
  rank: number;
}

export interface SearchResponse {
  results: SearchResult[];
  recommendations: SearchResult[];
  query: string;
}
