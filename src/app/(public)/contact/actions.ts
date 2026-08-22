"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface SubmitContactMessageRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactMessage(data: SubmitContactMessageRequest) {
  try {
    // Validate input first
    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
      return { success: false, error: "Please fill in all required fields" };
    }

    if (!EMAIL_REGEX.test(data.email.trim())) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const message = data.message.trim();
    if (message.length < 10) {
      return { success: false, error: "Please write at least 10 characters" };
    }

    if (message.length > 5000) {
      return { success: false, error: "Message is too long (max 5000 characters)" };
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

    // Atomic, DB-backed rate limits (per IP and per email)
    const supabase = await createClient();
    const email = data.email.trim().toLowerCase();
    const claims = await Promise.all([
      ip !== "unknown"
        ? supabase.rpc("claim_rate_limit", { p_key: `contact:ip:${ip}`, p_max: 5, p_window_seconds: 3600 })
        : Promise.resolve({ data: true, error: null }),
      supabase.rpc("claim_rate_limit", { p_key: `contact:email:${email}`, p_max: 5, p_window_seconds: 86400 }),
    ]);
    if (claims.some((c) => c.error || c.data === false)) {
      return {
        success: false,
        error: "Too many submissions. Please try again later.",
      };
    }

    // Create contact message
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name.trim(),
      email,
      subject: data.subject?.trim() || null,
      message,
      ip_address: ip,
    });

    if (error) {
      console.error("Error creating contact message:", error);
      return { success: false, error: "Failed to send your message. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in submitContactMessage:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: `Error: ${errorMessage}` };
  }
}
