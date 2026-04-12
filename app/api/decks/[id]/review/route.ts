import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessDeck } from '@/lib/deck-access';
import { sortFlashcardsForReviewQueue } from '@/lib/spaced-repetition';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;
    const scope = request.nextUrl.searchParams.get('scope');

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    if (!canAccessDeck(request, deck)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const now = new Date();
    const where =
      scope === 'all'
        ? { deckId }
        : {
            deckId,
            nextReview: { lte: now },
          };

    const raw = await prisma.flashcard.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const cards = sortFlashcardsForReviewQueue(raw, now);

    return NextResponse.json({
      deckId,
      cards,
      dueCount: scope === 'all' ? raw.filter((c) => c.nextReview <= now).length : cards.length,
      scope: scope === 'all' ? 'all' : 'due',
    });
  } catch (error) {
    console.error('Review queue error:', error);
    const message = error instanceof Error ? error.message : 'Failed to build review queue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
