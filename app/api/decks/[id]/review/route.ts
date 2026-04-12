import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessDeck } from '@/lib/deck-access';

export const runtime = 'nodejs';

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    if (!canAccessDeck(request, deck)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const now = new Date();
    const due = await prisma.flashcard.findMany({
      where: {
        deckId,
        nextReview: { lte: now },
      },
      orderBy: { createdAt: 'asc' },
    });

    const cards = shuffle(due);

    return NextResponse.json({
      deckId,
      cards,
      dueCount: cards.length,
    });
  } catch (error) {
    console.error('Review queue error:', error);
    const message = error instanceof Error ? error.message : 'Failed to build review queue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
