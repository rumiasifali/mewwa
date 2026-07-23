-- ============================================
-- QAAQ Dry Fruits — Supabase Database Schema
-- ============================================
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Categories
-- ============================================
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Products
-- ============================================
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  origin text,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  images text[] default '{}',
  weights jsonb not null default '[]',
  -- weights format: [{"grams": 250, "label": "250g", "price": 850, "currency": "PKR"}]
  nutrition jsonb,
  -- nutrition format: {"serving_size": "30g", "calories": 164, "protein": "6g", "fat": "14g", "carbs": "6g", "fiber": "3.5g"}
  tags text[] default '{}',
  is_featured boolean default false,
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Blog Posts
-- ============================================
create table posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Site Settings (single-row table)
-- ============================================
create table site_settings (
  id uuid default uuid_generate_v4() primary key,
  site_name text default 'QAAQ',
  tagline text default 'Premium Dry Fruits & Nuts',
  whatsapp_number text,
  email text,
  phone text,
  address text,
  currency text default 'PKR',
  social_links jsonb default '{}',
  -- format: {"instagram": "...", "facebook": "..."}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_products_category on products(category_id);
create index idx_products_slug on products(slug);
create index idx_products_featured on products(is_featured) where is_featured = true;
create index idx_products_available on products(is_available) where is_available = true;
create index idx_categories_slug on categories(slug);
create index idx_posts_slug on posts(slug);
create index idx_posts_published on posts(published) where published = true;

-- ============================================
-- Updated_at trigger
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at
  before update on categories
  for each row execute function update_updated_at();

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

-- Categories: public read, authenticated write
alter table categories enable row level security;
create policy "Public can read categories" on categories for select using (true);
create policy "Authenticated can select categories" on categories for select using (auth.role() = 'authenticated');
create policy "Authenticated can insert categories" on categories for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update categories" on categories for update using (auth.role() = 'authenticated');
create policy "Authenticated can delete categories" on categories for delete using (auth.role() = 'authenticated');

-- Products: public read, authenticated write
alter table products enable row level security;
create policy "Public can read available products" on products for select using (is_available = true);
create policy "Authenticated can read all products" on products for select using (auth.role() = 'authenticated');
create policy "Authenticated can insert products" on products for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update products" on products for update using (auth.role() = 'authenticated');
create policy "Authenticated can delete products" on products for delete using (auth.role() = 'authenticated');

-- Posts: public read published, authenticated write
alter table posts enable row level security;
create policy "Public can read published posts" on posts for select using (published = true);
create policy "Authenticated can read all posts" on posts for select using (auth.role() = 'authenticated');
create policy "Authenticated can insert posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update posts" on posts for update using (auth.role() = 'authenticated');
create policy "Authenticated can delete posts" on posts for delete using (auth.role() = 'authenticated');

-- Site Settings: public read, authenticated write
alter table site_settings enable row level security;
create policy "Public can read settings" on site_settings for select using (true);
create policy "Authenticated can insert settings" on site_settings for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update settings" on site_settings for update using (auth.role() = 'authenticated');
create policy "Authenticated can delete settings" on site_settings for delete using (auth.role() = 'authenticated');

-- ============================================
-- Storage bucket for product images
-- ============================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Authenticated can upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Authenticated can update product images"
on storage.objects for update
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Authenticated can delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================
-- Seed data — categories
-- ============================================
insert into categories (name, slug, description, sort_order) values
  ('Nuts', 'nuts', 'Premium quality nuts from the finest sources', 1),
  ('Dried Fruits', 'dried-fruits', 'Sun-dried fruits packed with natural sweetness', 2),
  ('Seeds', 'seeds', 'Nutrient-rich seeds for healthy snacking', 3),
  ('Gift Boxes', 'gift-boxes', 'Curated gift boxes for every occasion', 4);

-- ============================================
-- Seed data — initial site settings
-- ============================================
insert into site_settings (site_name, tagline, whatsapp_number, email, phone, address, currency, social_links)
values (
  'QAAQ',
  'From the Mountains to Your Doorstep',
  '923001234567',
  'hello@qaaq.pk',
  '+92 300 1234567',
  'Pakistan',
  'PKR',
  '{"instagram": "https://instagram.com/qaaq.pk", "facebook": "https://facebook.com/qaaq.pk"}'
);
