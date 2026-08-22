"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface SubmitFeedbackRequest {
  name: string;
  email: string;
  location: string;
  rating: number;
  content: string;
  product_id: string | null;
}

export async function submitFeedback(data: SubmitFeedbackRequest) {
  try {
    // Validate input first
    if (!data.name?.trim() || !data.email?.trim() || !data.location?.trim() || !data.content?.trim()) {
      return { success: false, error: "Please fill in all required fields" };
    }

    if (data.content.length < 20) {
      return { success: false, error: "Please write at least 20 characters for your review" };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: "Invalid rating" };
    }

    // Get client IP from headers
    let ip = "unknown";
    try {
      const headersList = await headers();
      const forwarded = headersList.get("x-forwarded-for");
      ip = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || "unknown";
    } catch (e) {
      console.warn("Could not get client IP:", e);
    }

    // Atomic, DB-backed rate limits (per IP and per email). Claiming
    // before the insert means a denied claim consumes nothing.
    const supabase = await createClient();
    const email = data.email.trim().toLowerCase();
    const claims = await Promise.all([
      ip !== "unknown"
        ? supabase.rpc("claim_rate_limit", { p_key: `feedback:ip:${ip}`, p_max: 5, p_window_seconds: 3600 })
        : Promise.resolve({ data: true, error: null }),
      supabase.rpc("claim_rate_limit", { p_key: `feedback:email:${email}`, p_max: 3, p_window_seconds: 86400 }),
    ]);
    if (claims.some((c) => c.error || c.data === false)) {
      return {
        success: false,
        error: "Too many submissions. Please try again later.",
      };
    }

    // Create testimonial
    // Note: Don't chain .select() — unauthenticated users can't read back
    // pending rows due to RLS (only approved are publicly visible).
    const { error } = await supabase.from("testimonials").insert({
      name: data.name.trim(),
      email,
      location: data.location.trim(),
      rating: data.rating,
      content: data.content.trim(),
      product_id: data.product_id || null,
      ip_address: ip,
      status: "pending",
    });

    if (error) {
      console.error("Error creating testimonial:", error);
      return { success: false, error: "Failed to submit your review. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in submitFeedback:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: `Error: ${errorMessage}` };
  }
}
