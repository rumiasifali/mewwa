/**
 * Best-effort in-memory sliding-window rate limiter.
 *
 * Per-instance only: on serverless each instance keeps its own counters,
 * so this bounds abuse per warm instance rather than globally. Endpoints
 * with real abuse cost (orders) pair this with a DB-backed check.
 */
const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 10_000;

export function checkApiRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Opportunistic cleanup so the map can't grow unbounded
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, times] of buckets) {
      if (times.length === 0 || times[times.length - 1] < cutoff) {
        buckets.delete(k);
      }
    }
  }

  const times = (buckets.get(key) || []).filter((t) => t >= cutoff);
  if (times.length >= limit) {
    buckets.set(key, times);
    return false;
  }
  times.push(now);
  buckets.set(key, times);
  return true;
}

/** Client IP for rate-limit keying (trustworthy behind Vercel's proxy). */
export function getRequestIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
