import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';
import { DS } from '@/lib/db-enums';

export const runtime = 'nodejs';

/** Max time a deck can sit in GENERATING before we auto-fail it (3 minutes) */
const STALE_GENERATING_MS = 3 * 60 * 1000;

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
      createdAt: true,
      generationError: true,
      userId: true,
      _count: { select: { flashcards: true } },
    },
  });

  if (!deck || deck.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // ── Stale generation check ──────────────────────────────────────────────
  // If a deck has been stuck in GENERATING for over 3 min, something went wrong.
  // Auto-recover: if cards exist, mark READY; otherwise mark FAILED.
  if (deck.status === 'GENERATING') {
    const age = Date.now() - new Date(deck.createdAt).getTime();
    if (age > STALE_GENERATING_MS) {
      if (deck._count.flashcards > 0) {
        // cards were created but status update failed — recover gracefully
        await prisma.deck.update({
          where: { id },
          data: { status: DS.READY },
        });
        return NextResponse.json({
          status: 'READY',
          flashcardCount: deck._count.flashcards,
          error: null,
        });
      } else {
        // no cards and timed-out — mark as failed
        const errMsg = 'Generation timed out. The AI took too long — try uploading again.';
        await prisma.deck.update({
          where: { id },
          data: { status: DS.FAILED, generationError: errMsg },
        });
        return NextResponse.json({
          status: 'FAILED',
          flashcardCount: 0,
          error: errMsg,
        });
      }
    }
  }

  return NextResponse.json({
    status: deck.status,           // GENERATING | READY | FAILED
    flashcardCount: deck._count.flashcards,
    error: deck.generationError ?? null,
  });
}
