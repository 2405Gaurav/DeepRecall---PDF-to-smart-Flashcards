import { NextResponse } from 'next/server';
import { CUE_SESSION_COOKIE } from '@/lib/session-cookie';

export const runtime = 'nodejs';

/** POST /api/auth/logout — clears the session cookie */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUE_SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
