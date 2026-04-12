import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDeckListStatsForUser } from '@/lib/deck-stats';
import { readSessionUserId } from '@/lib/session-cookie';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const uid = readSessionUserId(request);
    if (!uid) {
      return NextResponse.json({ decks: [] });
    }
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user?.onboardingCompletedAt) {
      return NextResponse.json({ decks: [] });
    }
    const decks = await getDeckListStatsForUser(uid);
    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Get decks error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch decks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
