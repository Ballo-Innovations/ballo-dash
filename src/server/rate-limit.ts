/**
 * Fixed-window rate limiter (H-13).
 *
 * Production uses Upstash Redis (shared across serverless instances); local
 * development and tests fall back to an in-memory store. env.ts makes Redis
 * mandatory in staging and production.
 */
import { Redis } from "@upstash/redis";

export interface RateLimitStore {
  /** Increments the counter for `key` and returns the new count; the key expires after `windowSeconds`. */
  hit(key: string, windowSeconds: number): Promise<number>;
}

export interface RateLimitRule {
  /** Short name that becomes part of the key, for example "login". */
  name: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly counts = new Map<string, { count: number; expiresAt: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  async hit(key: string, windowSeconds: number): Promise<number> {
    const now = this.now();
    const entry = this.counts.get(key);
    if (!entry || entry.expiresAt <= now) {
      this.counts.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
      if (this.counts.size > 10_000) this.sweep(now);
      return 1;
    }
    entry.count += 1;
    return entry.count;
  }

  private sweep(now: number) {
    this.counts.forEach((value, key) => {
      if (value.expiresAt <= now) this.counts.delete(key);
    });
  }
}

export class UpstashRateLimitStore implements RateLimitStore {
  constructor(private readonly redis: Redis) {}

  async hit(key: string, windowSeconds: number): Promise<number> {
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds, "NX");
    const [count] = (await pipeline.exec()) as [number, number];
    return count;
  }
}

let defaultStore: RateLimitStore | undefined;

export function getRateLimitStore(): RateLimitStore {
  if (defaultStore) return defaultStore;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  defaultStore = url && token ? new UpstashRateLimitStore(new Redis({ url, token })) : new MemoryRateLimitStore();
  return defaultStore;
}

/** Test hook. */
export function setRateLimitStore(store: RateLimitStore | undefined): void {
  defaultStore = store;
}

export async function checkRateLimit(
  rule: RateLimitRule,
  identity: string,
  store: RateLimitStore = getRateLimitStore(),
  now: () => number = Date.now
): Promise<RateLimitResult> {
  const window = Math.floor(now() / 1000 / rule.windowSeconds);
  const key = `rl:${rule.name}:${identity}:${window}`;
  const count = await store.hit(key, rule.windowSeconds);
  const windowEnds = (window + 1) * rule.windowSeconds;
  return {
    allowed: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil(windowEnds - now() / 1000)),
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Record<string, string | string[] | undefined>, fallback = "unknown"): string {
  const forwarded = headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  const real = headers["x-real-ip"];
  return first || (Array.isArray(real) ? real[0] : real) || fallback;
}
