import { prisma } from '@/lib/prisma';
import { ML, type MasteryLevelLiteral } from '@/lib/db-enums';
import type { DeckDetailStats } from '@/lib/types';

const LEGACY_MASTER_INTERVAL = 7;

export type DeckListItem = {
  id: string;
  title: string;
  createdAt: Date;
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  familiarCards: number;
  masteredCards: number;
  /** @deprecated use masteredCards + masteryLevel breakdown */
  inProgressCards: number;
};

async function countByMastery(deckId: string, level: MasteryLevelLiteral) {
  return prisma.flashcard.count({ where: { deckId, masteryLevel: level } });
}

export async function getDeckListStatsForUser(userId: string): Promise<DeckListItem[]> {
  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  const now = new Date();
  const items: DeckListItem[] = [];

  for (const d of decks) {
    const [totalCards, dueCards, newCards, learningCards, familiarCards, masteredCards] =
      await Promise.all([
        prisma.flashcard.count({ where: { deckId: d.id } }),
        prisma.flashcard.count({
          where: { deckId: d.id, nextReview: { lte: now } },
        }),
        countByMastery(d.id, ML.NEW),
        countByMastery(d.id, ML.LEARNING),
        countByMastery(d.id, ML.FAMILIAR),
        countByMastery(d.id, ML.MASTERED),
      ]);

    const inProgressCards = Math.max(0, totalCards - masteredCards);

    items.push({
      id: d.id,
      title: d.title,
      createdAt: d.createdAt,
      totalCards,
      dueCards,
      newCards,
      learningCards,
      familiarCards,
      masteredCards,
      inProgressCards,
    });
  }

  return items;
}

export async function getDeckDetailStats(deckId: string): Promise<DeckDetailStats> {
  const now = new Date();
  const [totalCards, dueCards, newCards, learningCards, familiarCards, masteredCards] =
    await Promise.all([
      prisma.flashcard.count({ where: { deckId } }),
      prisma.flashcard.count({
        where: { deckId, nextReview: { lte: now } },
      }),
      countByMastery(deckId, ML.NEW),
      countByMastery(deckId, ML.LEARNING),
      countByMastery(deckId, ML.FAMILIAR),
      countByMastery(deckId, ML.MASTERED),
    ]);

  const masteredPct = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  return {
    totalCards,
    dueCards,
    newCards,
    learningCards,
    familiarCards,
    masteredCards,
    masteredPct,
  };
}

export { LEGACY_MASTER_INTERVAL as MASTER_INTERVAL_THRESHOLD };
