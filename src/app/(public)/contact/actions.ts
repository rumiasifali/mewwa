"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, recordSubmissionAttempt } from "@/lib/supabase/rate-limit";
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

    // Check rate limits
    const rateLimit = await checkRateLimit(ip, data.email);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: rateLimit.reason || "Too many submissions. Please try again later.",
      };
    }

    // Create contact message
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject?.trim() || null,
      message,
      ip_address: ip,
    });

    if (error) {
      console.error("Error creating contact message:", error);
      return { success: false, error: `Failed to send: ${error.message}` };
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
    console.error("Unexpected error in submitContactMessage:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: `Error: ${errorMessage}` };
  }
}
