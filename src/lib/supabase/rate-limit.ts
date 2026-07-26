import { createClient } from "@/lib/supabase/server";

const RATE_LIMITS = {
  // Max 3 submissions per IP per 24 hours
  IP_PER_DAY: 3,
  // Max 2 submissions per email per 24 hours
  EMAIL_PER_DAY: 2,
  // Max 5 submissions per IP per hour (for aggressive spam)
  IP_PER_HOUR: 5,
};

const HOURS_24 = 24 * 60 * 60 * 1000;
const HOURS_1 = 60 * 60 * 1000;

/**
 * Get client IP address from request headers
 */
export function getClientIp(request?: Request): string {
  if (!request) return "unknown";

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Check if IP/email has exceeded rate limits.
 * Must be called from a server context (server action / route handler).
 */
export async function checkRateLimit(
  ipAddress: string,
  email: string
): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  if (ipAddress === "unknown") {
    return { allowed: true };
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - HOURS_24);
  const oneHourAgo = new Date(now.getTime() - HOURS_1);

  try {
    const supabase = await createClient();

    // Check IP rate limit (24 hours)
    const { count: ipCount24h, error: ipError24h } = await supabase
      .from("testimonial_submissions")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ipAddress)
      .gte("submitted_at", oneDayAgo.toISOString());

    if (ipError24h) {
      console.warn("Rate limit check error (IP 24h):", ipError24h.message);
    } else if ((ipCount24h || 0) >= RATE_LIMITS.IP_PER_DAY) {
      return {
        allowed: false,
        reason: "Too many submissions from your IP. Please try again later.",
        retryAfter: Math.ceil(HOURS_24 / 1000),
      };
    }

    // Check IP rate limit (1 hour — aggressive spam detection)
    const { count: ipCount1h, error: ipError1h } = await supabase
      .from("testimonial_submissions")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ipAddress)
      .gte("submitted_at", oneHourAgo.toISOString());

    if (ipError1h) {
      console.warn("Rate limit check error (IP 1h):", ipError1h.message);
    } else if ((ipCount1h || 0) >= RATE_LIMITS.IP_PER_HOUR) {
      return {
        allowed: false,
        reason: "Too many submissions in a short time. Please try again in an hour.",
        retryAfter: Math.ceil(HOURS_1 / 1000),
      };
    }

    // Check email rate limit (24 hours)
    const { count: emailCount, error: emailError } = await supabase
      .from("testimonial_submissions")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("submitted_at", oneDayAgo.toISOString());

    if (emailError) {
      console.warn("Rate limit check error (email):", emailError.message);
    } else if ((emailCount || 0) >= RATE_LIMITS.EMAIL_PER_DAY) {
      return {
        allowed: false,
        reason: "Too many submissions from this email. Please try again tomorrow.",
        retryAfter: Math.ceil(HOURS_24 / 1000),
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true }; // Fail open
  }
}

/**
 * Record a submission attempt for rate limiting.
 * Must be called from a server context.
 */
export async function recordSubmissionAttempt(
  ipAddress: string,
  email: string
): Promise<boolean> {
  if (ipAddress === "unknown") return true;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("testimonial_submissions").insert({
      ip_address: ipAddress,
      email: email.toLowerCase(),
    });

    if (error) {
      console.error("Error recording submission:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error recording submission attempt:", error);
    return false;
  }
}
