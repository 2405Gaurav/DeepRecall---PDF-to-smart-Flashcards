import type { NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyToken } from '@/lib/jwt';

// kept for backward compat — old cookie name
export const CUE_SESSION_COOKIE = AUTH_COOKIE;

/** Read session user ID from the JWT cookie on a NextRequest (used in API routes). */
export function readSessionUserId(request: NextRequest): string | null {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

/** @deprecated — use readSessionUserId instead. Kept for any legacy callers. */
export function parseSessionUserId(value: string | undefined): string | null {
  if (!value) return null;
  const payload = verifyToken(value);
  return payload?.userId ?? null;
}
