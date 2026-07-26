"use server";

import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function updateTestimonialStatusAction(
  id: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ status })
    .eq("id", id);

  return !error;
}

export async function deleteTestimonialAction(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  return !error;
}
