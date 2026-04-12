import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canAccessDeck } from '@/lib/deck-access';

export const runtime = 'nodejs';

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

    const cards = await prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ deckId, cards });
  } catch (error) {
    console.error('Deck cards error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch cards';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
