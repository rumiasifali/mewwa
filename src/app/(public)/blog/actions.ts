"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const normalized = email?.trim().toLowerCase() ?? "";

    if (!normalized || !EMAIL_REGEX.test(normalized)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // Get client IP from headers
    let ip = "unknown";
    try {
      const headersList = await headers();
      const forwarded = headersList.get("x-forwarded-for");
      ip = forwarded
        ? forwarded.split(",")[0].trim()
        : headersList.get("x-real-ip") || "unknown";
    } catch (e) {
      console.warn("Could not get client IP:", e);
    }

    const supabase = await createClient();

    // Atomic rate limit: 5 attempts per IP per hour
    const { data: allowed, error: rateError } = await supabase.rpc(
      "claim_rate_limit",
      { p_key: `newsletter:${ip}`, p_max: 5, p_window_seconds: 3600 }
    );

    if (rateError) {
      console.error("Rate limit check failed:", rateError);
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }

    if (!allowed) {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: normalized });

    if (error) {
      // Unique violation — already subscribed, treat as success
      if (error.code === "23505") {
        return { success: true, message: "You're already subscribed." };
      }
      console.error("Newsletter subscribe failed:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }

    return { success: true, message: "Thanks — you're on the list." };
  } catch (e) {
    console.error("Unexpected error in subscribeToNewsletter:", e);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
