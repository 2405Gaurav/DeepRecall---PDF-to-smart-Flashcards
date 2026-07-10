import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { getUserAnalytics } from '@/lib/user-analytics';
import { redis } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user?.onboardingCompletedAt) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const cacheKey = `dashboard:user:${user.id}`;
  
  try {
    // We use a cache-aside pattern to reduce database load for the dashboard API.
    // 1. Check Redis first
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      // Cache hit: return the cached JSON
      return NextResponse.json({ analytics: JSON.parse(cachedData) });
    }
  } catch (error) {
    // Handle Redis failures gracefully, proceed to DB fetch if Redis is down
    console.warn(`Redis cache get failed for user ${user.id}:`, error);
  }

  // Cache miss: fetch dashboard data from PostgreSQL using Prisma
  const analytics = await getUserAnalytics(user.id);
  
  try {
    // Store JSON in Redis with TTL = 300 seconds (5 minutes)
    await redis.setex(cacheKey, 300, JSON.stringify(analytics));
  } catch (error) {
    console.warn(`Redis cache set failed for user ${user.id}:`, error);
  }

  return NextResponse.json({ analytics });
}
