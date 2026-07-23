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
