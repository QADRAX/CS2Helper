type Bucket = { resetAt: number; count: number };

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window in-memory rate limiter (single instance; OK behind one nginx upstream).
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { resetAt: now + windowMs, count: 0 };
    buckets.set(key, b);
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
