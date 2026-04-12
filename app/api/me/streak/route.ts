import { NextResponse } from 'next/server';
import { readSessionUserId } from '@/lib/session-cookie';
import { getUserStreak } from '@/lib/streaks';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('cue_session')?.value;
  if (!raw) {
    return NextResponse.json({ streak: null });
  }

  let userId: string;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    userId = parsed.userId;
    if (!userId) throw new Error('no userId');
  } catch {
    return NextResponse.json({ streak: null });
  }

  try {
    const streak = await getUserStreak(userId);
    return NextResponse.json({ streak });
  } catch {
    return NextResponse.json({ streak: null }, { status: 500 });
  }
}
