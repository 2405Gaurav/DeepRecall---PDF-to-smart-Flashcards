import { prisma } from '@/lib/prisma';

const MASTER_INTERVAL_THRESHOLD = 7;

export type DeckListItem = {
  id: string;
  title: string;
  createdAt: Date;
  totalCards: number;
  dueCards: number;
  masteredCards: number;
  inProgressCards: number;
};

export async function getDeckListStatsForUser(userId: string): Promise<DeckListItem[]> {
  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  const now = new Date();

  const items: DeckListItem[] = [];

  for (const d of decks) {
    const [totalCards, dueCards, masteredCards] = await Promise.all([
      prisma.flashcard.count({ where: { deckId: d.id } }),
      prisma.flashcard.count({
        where: { deckId: d.id, nextReview: { lte: now } },
      }),
      prisma.flashcard.count({
        where: { deckId: d.id, interval: { gt: MASTER_INTERVAL_THRESHOLD } },
      }),
    ]);

    const inProgressCards = Math.max(0, totalCards - masteredCards);

    items.push({
      id: d.id,
      title: d.title,
      createdAt: d.createdAt,
      totalCards,
      dueCards,
      masteredCards,
      inProgressCards,
    });
  }

  return items;
}

export async function getDeckDetailStats(deckId: string) {
  const now = new Date();
  const [totalCards, dueCards, masteredCards] = await Promise.all([
    prisma.flashcard.count({ where: { deckId } }),
    prisma.flashcard.count({
      where: { deckId, nextReview: { lte: now } },
    }),
    prisma.flashcard.count({
      where: { deckId, interval: { gt: MASTER_INTERVAL_THRESHOLD } },
    }),
  ]);

  return {
    totalCards,
    dueCards,
    masteredCards,
    inProgressCards: Math.max(0, totalCards - masteredCards),
  };
}

export { MASTER_INTERVAL_THRESHOLD };
