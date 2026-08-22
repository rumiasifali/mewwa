"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import type { Testimonial } from "@/types";

export interface MatchedOrder {
  id: string;
  ref: string;
  status: string;
  items_summary: string | null;
  created_at: string;
}

export interface TestimonialWithOrder extends Testimonial {
  matched_order: MatchedOrder | null;
  product_name: string | null;
}

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface TestimonialPageResult {
  items: TestimonialWithOrder[];
  total: number;
}

export interface TestimonialCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export async function getTestimonials(
  status: TestimonialStatus,
  page: number,
  pageSize = 20
): Promise<TestimonialPageResult> {
  if (!(await requireAdmin())) return { items: [], total: 0 };
  const supabase = await createClient();
  const from = Math.max(0, (page - 1) * pageSize);
  const { data, error, count } = await supabase
    .from("testimonials")
    .select("*", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error || !data) return { items: [], total: 0 };

  const total = count ?? 0;

  // Collect unique emails to look up matching orders
  const emails = [...new Set(data.map((t: Testimonial) => t.email).filter(Boolean))];

  const ordersByEmail: Record<string, MatchedOrder> = {};

  if (emails.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, ref, status, items_summary, created_at, customer_email")
      .in("customer_email", emails)
      .order("created_at", { ascending: false });

    if (orders) {
      for (const order of orders) {
        // Keep the most recent order per email
        if (!ordersByEmail[order.customer_email]) {
          ordersByEmail[order.customer_email] = {
            id: order.id,
            ref: order.ref,
            status: order.status,
            items_summary: order.items_summary ?? null,
            created_at: order.created_at,
          };
        }
      }
    }
  }

  // Fetch product names for testimonials that have a product_id
  const productIds = [
    ...new Set(data.map((t: Testimonial) => t.product_id).filter(Boolean)),
  ] as string[];

  const productsById: Record<string, string> = {};

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    if (products) {
      for (const p of products) {
        productsById[p.id] = p.name;
      }
    }
  }

  const items = data.map((t: Testimonial) => ({
    ...t,
    matched_order: ordersByEmail[t.email] || null,
    product_name: t.product_id ? productsById[t.product_id] ?? null : null,
  }));

  return { items, total };
}

export async function getTestimonialCounts(): Promise<TestimonialCounts> {
  const empty: TestimonialCounts = { pending: 0, approved: 0, rejected: 0 };
  if (!(await requireAdmin())) return empty;
  const supabase = await createClient();

  const statuses: TestimonialStatus[] = ["pending", "approved", "rejected"];
  const results = await Promise.all(
    statuses.map((status) =>
      supabase
        .from("testimonials")
        .select("id", { count: "exact", head: true })
        .eq("status", status)
    )
  );

  return {
    pending: results[0].count ?? 0,
    approved: results[1].count ?? 0,
    rejected: results[2].count ?? 0,
  };
}

export async function updateTestimonialStatusAction(
  id: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  if (!(await requireAdmin())) return false;
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ status })
    .eq("id", id);

  return !error;
}

export async function deleteTestimonialAction(id: string): Promise<boolean> {
  if (!(await requireAdmin())) return false;
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  return !error;
}
