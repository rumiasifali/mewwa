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

export async function getTestimonials(): Promise<TestimonialWithOrder[]> {
  if (!(await requireAdmin())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

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

  return data.map((t: Testimonial) => ({
    ...t,
    matched_order: ordersByEmail[t.email] || null,
    product_name: t.product_id ? productsById[t.product_id] ?? null : null,
  }));
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
