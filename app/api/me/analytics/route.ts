import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { getUserAnalytics } from '@/lib/user-analytics';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user?.onboardingCompletedAt) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const analytics = await getUserAnalytics(user.id);
  return NextResponse.json({ analytics });
}
