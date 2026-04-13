import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';

export const runtime = 'nodejs';

/** Lightweight polling endpoint — called every 2.5s by the deck page while status=GENERATING */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const userId = readSessionUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deck = await prisma.deck.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      generationError: true,
      userId: true,
      _count: { select: { flashcards: true } },
    },
  });

  if (!deck || deck.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: deck.status,           // GENERATING | READY | FAILED
    flashcardCount: deck._count.flashcards,
    error: deck.generationError ?? null,
  });
}
