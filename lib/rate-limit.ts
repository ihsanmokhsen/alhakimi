/**
 * Rate limiter sederhana berbasis fixed window, tersimpan di memori proses.
 *
 * Cukup untuk melindungi kuota Gemini & endpoint publik dari penyalahgunaan
 * pada skala satu situs portofolio. Catatan: di serverless (Vercel) setiap
 * instance lambda punya memori sendiri, jadi limit ini adalah batas minimum
 * per instance — bukan batas global yang presisi.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Batasi ukuran map agar memori tidak tumbuh tanpa batas. */
const MAX_BUCKETS = 10_000;

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Sisa permintaan yang masih boleh dilakukan dalam jendela ini. */
  remaining: number;
  /** Detik sampai jendela direset (0 kalau ok). */
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    sweepExpired(now);
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    };
  }

  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Ambil IP klien dari header proxy standar (Vercel menyediakan x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
