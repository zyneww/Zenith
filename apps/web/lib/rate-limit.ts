// apps/web/lib/rate-limit.ts
import { redis } from "@/lib/redis";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

// Sliding window rate limiter
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const { maxRequests, windowMs, keyPrefix } = config;
  const now = Date.now();
  const key = `${keyPrefix}:${identifier}`;
  
  // Remove old entries outside the window
  const windowStart = now - windowMs;
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // Count current requests in window
  const currentCount = await redis.zcard(key);
  
  if (currentCount >= maxRequests) {
    // Get the oldest request to calculate reset time
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldest.length > 1 ? parseInt(oldest[1]) + windowMs : now + windowMs;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }
  
  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  // Set expiry on the key
  await redis.pexpire(key, windowMs);
  
  return {
    allowed: true,
    remaining: maxRequests - currentCount - 1,
    resetTime: now + windowMs,
  };
}

// Middleware factory for Next.js routes
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(request: Request): Promise<Response | null> {
    // Get IP from request
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    
    const result = await rateLimit(ip, config);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          },
        }
      );
    }
    
    // Return null to allow the request to proceed
    return null;
  };
}

// Preset configs
export const rateLimits = {
  market: {
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
    keyPrefix: 'ratelimit:market',
  } as RateLimitConfig,
  
  webhook: {
    maxRequests: 50,
    windowMs: 60_000, // 1 minute
    keyPrefix: 'ratelimit:webhook',
  } as RateLimitConfig,
  
  default: {
    maxRequests: 60,
    windowMs: 60_000, // 1 minute
    keyPrefix: 'ratelimit:default',
  } as RateLimitConfig,
};
