import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';
import { ReviewOutcome } from '@prisma/client';

export const runtime = 'nodejs';

const patchSchema = z
  .object({
    outcome: z.enum(['EASY', 'HARD']).optional(),
    difficulty: z.enum(['EASY', 'HARD']).optional(),
  })
  .refine((d) => d.outcome != null || d.difficulty != null, {
    message: 'Send { "outcome": "EASY" | "HARD" } (or legacy "difficulty").',
  });

function addUtcDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body. Send { "outcome": "EASY" | "HARD" }.' },
        { status: 400 }
      );
    }

    const outcome = parsed.data.outcome ?? parsed.data.difficulty!;
    const reviewOutcome = outcome === 'EASY' ? ReviewOutcome.EASY : ReviewOutcome.HARD;

    const card = await prisma.flashcard.findUnique({
      where: { id },
      include: { deck: { select: { userId: true } } },
    });
    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    const now = new Date();
    const newInterval = outcome === 'EASY' ? Math.max(1, card.interval * 2) : 1;
    const nextReview = addUtcDays(now, newInterval);

    const sessionUserId = readSessionUserId(request);
    if (card.deck.userId !== null) {
      if (!sessionUserId || card.deck.userId !== sessionUserId) {
        return NextResponse.json(
          { error: 'Sign in and open this deck from your studio to review cards.' },
          { status: 403 }
        );
      }
    }

    const ownerMatch = Boolean(sessionUserId && card.deck.userId === sessionUserId);

    const flashcard = await prisma.$transaction(async (tx) => {
      if (ownerMatch) {
        await tx.reviewLog.create({
          data: {
            userId: sessionUserId!,
            flashcardId: id,
            outcome: reviewOutcome,
          },
        });
      }

      return tx.flashcard.update({
        where: { id },
        data: {
          interval: newInterval,
          nextReview,
          lastReviewed: now,
          difficulty: outcome,
          ...(ownerMatch
            ? {
                easyCount: outcome === 'EASY' ? { increment: 1 } : undefined,
                hardCount: outcome === 'HARD' ? { increment: 1 } : undefined,
              }
            : {}),
        },
      });
    });

    return NextResponse.json({ flashcard });
  } catch (error) {
    console.error('Update flashcard error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update flashcard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
