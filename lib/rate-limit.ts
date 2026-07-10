import { redis } from './redis';

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in ms
};

/**
 * A simple fixed-window rate limiter using Redis.
 *
 * @param action - The action being limited (e.g., 'upload_pdf', 'review_card')
 * @param identifier - The user ID or IP address (e.g., 'user_123', 'ip_192.168.1.1')
 * @param limit - The maximum number of requests allowed in the window
 * @param windowSeconds - The duration of the window in seconds
 * @returns RateLimitResult indicating if the request should be allowed
 */
export async function rateLimit(
  action: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${action}:${identifier}`;

  try {
    const current = await redis.get(key);

    if (current && parseInt(current, 10) >= limit) {
      const ttl = await redis.pttl(key);
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Date.now() + (ttl > 0 ? ttl : windowSeconds * 1000),
      };
    }

    const multi = redis.multi();
    multi.incr(key);
    // Only set expire if the key is new (ttl is -1)
    if (!current) {
      multi.expire(key, windowSeconds);
    }
    
    const results = await multi.exec();
    
    // Fallback if transaction fails
    if (!results) {
      return { success: true, limit, remaining: limit - 1, reset: Date.now() + windowSeconds * 1000 };
    }

    const count = results[0][1] as number;
    const ttl = await redis.pttl(key);

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: Date.now() + (ttl > 0 ? ttl : windowSeconds * 1000),
    };
  } catch (error) {
    // Fail open: If Redis fails, allow the request so the app keeps functioning
    console.warn(`Rate limiter failed for ${key}:`, error);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}
