import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/jwt';

export const runtime = 'nodejs';

/** POST /api/auth/logout — clears the JWT session cookie */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
