import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';
import { ML, RO, type MasteryLevelLiteral, type ReviewOutcomeLiteral } from '@/lib/db-enums';
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

function addUtcDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function normalizeOutcome(
  raw: 'EASY' | 'HARD' | 'LEARNING' | 'FAMILIAR' | 'MASTERED'
): ReviewOutcomeLiteral {
  if (raw === 'EASY') return RO.EASY;
  if (raw === 'HARD') return RO.HARD;
  if (raw === 'LEARNING') return RO.LEARNING;
  if (raw === 'FAMILIAR') return RO.FAMILIAR;
  return RO.MASTERED;
}

function planUpdate(
  outcome: ReviewOutcomeLiteral,
  card: { interval: number; masteryLevel: string }
): {
  masteryLevel: MasteryLevelLiteral;
  interval: number;
  nextReview: Date;
  difficulty: 'EASY' | 'HARD' | 'NONE';
  easyInc: boolean;
  hardInc: boolean;
} {
  const now = new Date();

  switch (outcome) {
    case RO.LEARNING:
      return {
        masteryLevel: ML.LEARNING,
        interval: 1,
        nextReview: addUtcDays(now, 1),
        difficulty: 'HARD',
        easyInc: false,
        hardInc: true,
      };
    case RO.HARD:
      return {
        masteryLevel: ML.LEARNING,
        interval: 1,
        nextReview: addUtcDays(now, 1),
        difficulty: 'HARD',
        easyInc: false,
        hardInc: true,
      };
    case RO.FAMILIAR:
      return {
        masteryLevel: ML.FAMILIAR,
        interval: Math.max(3, Math.ceil(card.interval * 1.5)),
        nextReview: addUtcDays(now, Math.max(3, Math.ceil(card.interval * 1.5))),
        difficulty: 'EASY',
        easyInc: true,
        hardInc: false,
      };
    case RO.EASY:
      if (card.masteryLevel === ML.NEW || card.masteryLevel === ML.LEARNING) {
        return {
          masteryLevel: ML.FAMILIAR,
          interval: Math.max(2, card.interval * 2),
          nextReview: addUtcDays(now, Math.max(2, card.interval * 2)),
          difficulty: 'EASY',
          easyInc: true,
          hardInc: false,
        };
      }
      if (card.masteryLevel === ML.FAMILIAR) {
        return {
          masteryLevel: ML.MASTERED,
          interval: Math.max(7, card.interval * 2),
          nextReview: addUtcDays(now, Math.max(7, card.interval * 2)),
          difficulty: 'EASY',
          easyInc: true,
          hardInc: false,
        };
      }
      return {
        masteryLevel: ML.MASTERED,
        interval: Math.max(7, card.interval * 2),
        nextReview: addUtcDays(now, Math.max(7, card.interval * 2)),
        difficulty: 'EASY',
        easyInc: true,
        hardInc: false,
      };
    case RO.MASTERED:
      return {
        masteryLevel: ML.MASTERED,
        interval: Math.max(7, card.interval * 2),
        nextReview: addUtcDays(now, Math.max(7, card.interval * 2)),
        difficulty: 'EASY',
        easyInc: true,
        hardInc: false,
      };
  }
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
    const plan = planUpdate(reviewOutcome, {
      interval: card.interval,
      masteryLevel: card.masteryLevel,
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

    return NextResponse.json({ flashcard });
  } catch (error) {
    console.error('Update flashcard error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update flashcard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
