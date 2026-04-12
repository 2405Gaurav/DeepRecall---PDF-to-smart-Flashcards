import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';
import { recordPracticeDay } from '@/lib/streaks';

export const runtime = 'nodejs';

const completeSessionSchema = z.object({
  cardIds: z.array(z.string().min(1)).min(1),
});

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUserId = readSessionUserId(request);
    if (!sessionUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: deckId } = await params;
    const body = await request.json();
    const parsed = completeSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Send { "cardIds": ["..."] }.' }, { status: 400 });
    }

    const uniqueCardIds = [...new Set(parsed.data.cardIds)];

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { userId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (deck.userId !== sessionUserId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const ownedCards = await prisma.flashcard.findMany({
      where: {
        deckId,
        id: { in: uniqueCardIds },
      },
      select: { id: true },
    });

    if (ownedCards.length !== uniqueCardIds.length) {
      return NextResponse.json({ error: 'Some cards do not belong to this deck.' }, { status: 400 });
    }

    const reviewedToday = await prisma.reviewLog.findMany({
      where: {
        userId: sessionUserId,
        flashcardId: { in: uniqueCardIds },
        createdAt: { gte: startOfTodayUtc() },
      },
      select: { flashcardId: true },
      distinct: ['flashcardId'],
    });

    if (reviewedToday.length !== uniqueCardIds.length) {
      return NextResponse.json(
        { error: 'Complete the full session before the streak is counted.' },
        { status: 400 }
      );
    }

    const streak = await recordPracticeDay(sessionUserId);

    return NextResponse.json({ streak });
  } catch (error) {
    console.error('Complete practice session error:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete practice session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
