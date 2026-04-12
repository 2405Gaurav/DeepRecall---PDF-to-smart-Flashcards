import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';
import { RO, type ReviewOutcomeLiteral } from '@/lib/db-enums';
import { planReviewUpdate } from '@/lib/spaced-repetition';
import { recordPracticeDay } from '@/lib/streaks';
import type { ReviewOutcome } from '@prisma/client';

export const runtime = 'nodejs';

const patchSchema = z
  .object({
    outcome: z.enum(['EASY', 'HARD', 'LEARNING', 'FAMILIAR', 'MASTERED']).optional(),
    difficulty: z.enum(['EASY', 'HARD']).optional(),
  })
  .refine((d) => d.outcome != null || d.difficulty != null, {
    message: 'Send { "outcome": ... } (or legacy "difficulty").',
  });

function normalizeOutcome(
  raw: 'EASY' | 'HARD' | 'LEARNING' | 'FAMILIAR' | 'MASTERED'
): ReviewOutcomeLiteral {
  if (raw === 'EASY') return RO.EASY;
  if (raw === 'HARD') return RO.HARD;
  if (raw === 'LEARNING') return RO.LEARNING;
  if (raw === 'FAMILIAR') return RO.FAMILIAR;
  return RO.MASTERED;
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
        { error: 'Invalid body. Send { "outcome": "EASY" | "HARD" | "LEARNING" | "FAMILIAR" | "MASTERED" }.' },
        { status: 400 }
      );
    }

    const raw = parsed.data.outcome ?? parsed.data.difficulty!;
    const reviewOutcome = normalizeOutcome(raw);

    const card = await prisma.flashcard.findUnique({
      where: { id },
      include: { deck: { select: { userId: true } } },
    });
    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

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

    // pass easyCount + hardCount for personalized difficulty memory
    const plan = planReviewUpdate(reviewOutcome, {
      interval: card.interval,
      masteryLevel: card.masteryLevel,
      easyCount: card.easyCount,
      hardCount: card.hardCount,
    });
    const now = new Date();

    const flashcard = await prisma.$transaction(async (tx) => {
      if (ownerMatch) {
        await tx.reviewLog.create({
          data: {
            userId: sessionUserId!,
            flashcardId: id,
            outcome: reviewOutcome as ReviewOutcome,
          },
        });
      }

      return tx.flashcard.update({
        where: { id },
        data: {
          interval: plan.interval,
          nextReview: plan.nextReview,
          lastReviewed: now,
          difficulty: plan.difficulty,
          masteryLevel: plan.masteryLevel,
          ...(ownerMatch
            ? {
                easyCount: plan.easyInc ? { increment: 1 } : undefined,
                hardCount: plan.hardInc ? { increment: 1 } : undefined,
              }
            : {}),
        },
      });
    });

    // update streaks & award badges outside transaction (non-blocking)
    let streakInfo = null;
    if (ownerMatch && sessionUserId) {
      try {
        streakInfo = await recordPracticeDay(sessionUserId);
      } catch (e) {
        console.warn('Streak update failed (non-fatal):', e);
      }
    }

    // return session summary data alongside the card
    return NextResponse.json({
      flashcard,
      streak: streakInfo,
      sessionSummary: {
        updatedMasteryLevel: plan.updatedMasteryLevel,
        previousMasteryLevel: plan.previousMasteryLevel,
        nextReviewDate: plan.nextReviewDate,
        intervalDays: plan.intervalDays,
        isStruggleCard: plan.isStruggleCard,
        leveledUp: plan.previousMasteryLevel !== plan.updatedMasteryLevel &&
          masteryRank(plan.updatedMasteryLevel) > masteryRank(plan.previousMasteryLevel),
      },
    });
  } catch (error) {
    console.error('Update flashcard error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update flashcard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function masteryRank(level: string): number {
  switch (level) {
    case 'NEW': return 0;
    case 'LEARNING': return 1;
    case 'FAMILIAR': return 2;
    case 'MASTERED': return 3;
    default: return 0;
  }
}
