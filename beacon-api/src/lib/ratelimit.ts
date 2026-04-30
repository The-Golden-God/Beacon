import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function isConfigured() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  return url.startsWith("https://") && url.length > 20 && token.length > 10;
}

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!isConfigured()) return null;
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// 5 login attempts per 15 minutes per identifier (email or IP)
let _loginLimiter: Ratelimit | null = null;
function getLoginLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_loginLimiter) {
    _loginLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "beacon:login",
    });
  }
  return _loginLimiter;
}

// 100 letter generations per hour per workspace
let _letterLimiter: Ratelimit | null = null;
function getLetterLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_letterLimiter) {
    _letterLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      prefix: "beacon:letters",
    });
  }
  return _letterLimiter;
}

export type RateLimitResult = { allowed: boolean; remaining: number; reset: number };

export async function checkLoginRate(identifier: string): Promise<RateLimitResult> {
  const limiter = getLoginLimiter();
  if (!limiter) return { allowed: true, remaining: 999, reset: 0 };
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { allowed: success, remaining, reset };
}

export async function checkLetterGenRate(workspaceId: string): Promise<RateLimitResult> {
  const limiter = getLetterLimiter();
  if (!limiter) return { allowed: true, remaining: 999, reset: 0 };
  const { success, remaining, reset } = await limiter.limit(workspaceId);
  return { allowed: success, remaining, reset };
}
