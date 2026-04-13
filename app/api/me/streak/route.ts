import { NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyToken } from '@/lib/jwt';
import { getUserStreak } from '@/lib/streaks';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  // the session is a JWT stored in the cue_session cookie — same as auth-session.ts
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ streak: null });
  }

  const payload = verifyToken(token);
  if (!payload?.userId) {
    return NextResponse.json({ streak: null });
  }

  try {
    const streak = await getUserStreak(payload.userId);
    return NextResponse.json({ streak });
  } catch (err) {
    console.error('[streak] failed to load streak:', err);
    return NextResponse.json({ streak: null }, { status: 500 });
  }
}
