import Redis from 'ioredis';

// Instantiate Redis client if REDIS_URL is provided, otherwise it will try to connect to localhost:6379 by default
// For a production app, you might want a singleton pattern or conditionally instantiate based on env vars
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    // Avoid crashing the application if Redis is unavailable
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 1, // Don't retry indefinitely for single requests
  });

redis.on('error', (err) => {
  // Catch Redis connection errors to prevent them from crashing the Node.js process
  // console.warn('Redis client error:', err.message);
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/**
 * Invalidates the dashboard cache for a specific user.
 * Silently fails if Redis is unavailable to prevent app crashes.
 */
export async function invalidateDashboardCache(userId: string) {
  try {
    const key = `dashboard:user:${userId}`;
    await redis.del(key);
  } catch (error) {
    console.warn(`Failed to invalidate dashboard cache for user ${userId}:`, error);
  }
}
