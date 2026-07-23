"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, FolderOpen, FileText, Eye } from "lucide-react";
import Link from "next/link";

interface Stats {
  products: number;
  categories: number;
  posts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const [products, categories, posts] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        products: products.count ?? 0,
        categories: categories.count ?? 0,
        posts: posts.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Products",
      value: stats.products,
      icon: Package,
      href: "/admin/products",
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: FolderOpen,
      href: "/admin/categories",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Posts",
      value: stats.posts,
      icon: FileText,
      href: "/admin/posts",
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here&apos;s an overview of your store.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-accent transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Site
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group p-6 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                {loading ? "—" : card.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {card.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-accent transition-colors"
          >
            <Package className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Add New Product</p>
              <p className="text-xs text-muted-foreground">
                Create a new product listing
              </p>
            </div>
          </Link>
          <Link
            href="/admin/posts"
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-accent transition-colors"
          >
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Write a Post</p>
              <p className="text-xs text-muted-foreground">
                Create blog content for SEO
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
