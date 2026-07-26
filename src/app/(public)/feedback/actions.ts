"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, recordSubmissionAttempt, getClientIp } from "@/lib/supabase/rate-limit";
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

    // Check rate limits
    const rateLimit = await checkRateLimit(ip, data.email);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: rateLimit.reason || "Too many submissions. Please try again later.",
      };
    }

    // Create testimonial
    // Note: Don't chain .select() — unauthenticated users can't read back
    // pending rows due to RLS (only approved are publicly visible).
    const supabase = await createClient();
    const { error } = await supabase.from("testimonials").insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      location: data.location.trim(),
      rating: data.rating,
      content: data.content.trim(),
      product_id: data.product_id || null,
      ip_address: ip,
      status: "pending",
    });

    if (error) {
      console.error("Error creating testimonial:", error);
      return { success: false, error: `Failed to submit: ${error.message}` };
    }

    // Record submission for rate limiting
    try {
      await recordSubmissionAttempt(ip, data.email);
    } catch (e) {
      console.warn("Could not record submission attempt:", e);
      // Don't fail the whole request if recording fails
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in submitFeedback:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: `Error: ${errorMessage}` };
  }
}
