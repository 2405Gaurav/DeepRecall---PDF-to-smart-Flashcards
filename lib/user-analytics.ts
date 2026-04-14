import { prisma } from '@/lib/prisma';
import { ML } from '@/lib/db-enums';

type AnalyticsCard = {
  id: string;
  question: string;
  easyCount: number;
  hardCount: number;
  masteryLevel: string;
  deckTitle: string;
};

export type UserAnalyticsPayload = {
  totalReviews: number;
  easyTotal: number;
  hardTotal: number;
  last7Days: { day: string; count: number; easy: number; hard: number }[];
  decksOwned: number;
  cardsMastered: number;
  cardsDue: number;
  /** @deprecated kept for backwards compat — use strongCards / struggleCards */
  topCards: AnalyticsCard[];
  /** Cards user is strongest on: high easyCount, low hardCount */
  strongCards: AnalyticsCard[];
  /** Cards user struggles with: hardCount >= 2, ordered by hardest first */
  struggleCards: AnalyticsCard[];
  /** Per-mastery-level breakdown across all decks */
  masteryBreakdown: { new: number; learning: number; familiar: number; mastered: number };
  recentActivity: { at: string; outcome: string; questionSnippet: string; deckTitle: string }[];
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getUserAnalytics(userId: string): Promise<UserAnalyticsPayload> {
  const now = new Date();
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - 7);

  const deckIds = (
    await prisma.deck.findMany({
      where: { userId },
      select: { id: true },
    })
  ).map((d) => d.id);

  const cardSelect = {
    id: true,
    question: true,
    easyCount: true,
    hardCount: true,
    masteryLevel: true,
    deck: { select: { title: true } },
  } as const;

  const [logs, strongCardsRaw, struggleCardsRaw, decksOwned, totalAgg, totalReviewEvents] = await Promise.all([
    prisma.reviewLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true, outcome: true },
      orderBy: { createdAt: 'asc' },
    }),
    // strong cards — high easyCount, low hardCount, actually reviewed
    prisma.flashcard.findMany({
      where: { deck: { userId }, easyCount: { gte: 1 }, hardCount: { lt: 2 } },
      orderBy: [{ easyCount: 'desc' }],
      take: 6,
      select: cardSelect,
    }),
    // struggle cards — hardCount >= 2, ordered worst first
    prisma.flashcard.findMany({
      where: { deck: { userId }, hardCount: { gte: 2 } },
      orderBy: [{ hardCount: 'desc' }],
      take: 6,
      select: cardSelect,
    }),
    prisma.deck.count({ where: { userId } }),
    prisma.reviewLog.groupBy({
      by: ['outcome'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.reviewLog.count({ where: { userId } }),
  ]);

  const dayBuckets = new Map<string, { count: number; easy: number; hard: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    dayBuckets.set(dayKey(d), { count: 0, easy: 0, hard: 0 });
  }
  const isPositive = (o: string) =>
    o === 'EASY' || o === 'FAMILIAR' || o === 'MASTERED';
  const isStruggle = (o: string) => o === 'HARD' || o === 'LEARNING';

  for (const log of logs) {
    const k = dayKey(log.createdAt);
    if (!dayBuckets.has(k)) continue;
    const b = dayBuckets.get(k)!;
    b.count += 1;
    if (isPositive(log.outcome)) b.easy += 1;
    else if (isStruggle(log.outcome)) b.hard += 1;
  }

  const last7Days = Array.from(dayBuckets.entries()).map(([day, v]) => ({
    day,
    ...v,
  }));

  let cardsMastered = 0;
  let cardsDue = 0;
  const masteryBreakdown = { new: 0, learning: 0, familiar: 0, mastered: 0 };
  if (deckIds.length) {
    const [m, d, mNew, mLearning, mFamiliar] = await Promise.all([
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, masteryLevel: ML.MASTERED },
      }),
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, nextReview: { lte: now } },
      }),
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, masteryLevel: ML.NEW },
      }),
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, masteryLevel: ML.LEARNING },
      }),
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, masteryLevel: ML.FAMILIAR },
      }),
    ]);
    cardsMastered = m;
    cardsDue = d;
    masteryBreakdown.new = mNew;
    masteryBreakdown.learning = mLearning;
    masteryBreakdown.familiar = mFamiliar;
    masteryBreakdown.mastered = m;
  }

  const easyTotal =
    (totalAgg.find((x) => x.outcome === 'EASY')?._count._all ?? 0) +
    (totalAgg.find((x) => x.outcome === 'FAMILIAR')?._count._all ?? 0) +
    (totalAgg.find((x) => x.outcome === 'MASTERED')?._count._all ?? 0);
  const hardTotal =
    (totalAgg.find((x) => x.outcome === 'HARD')?._count._all ?? 0) +
    (totalAgg.find((x) => x.outcome === 'LEARNING')?._count._all ?? 0);

  const recentLogs = await prisma.reviewLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      createdAt: true,
      outcome: true,
      flashcard: { select: { question: true, deck: { select: { title: true } } } },
    },
  });

  const mapCard = (c: typeof strongCardsRaw[number]): AnalyticsCard => ({
    id: c.id,
    question: c.question,
    easyCount: c.easyCount,
    hardCount: c.hardCount,
    masteryLevel: c.masteryLevel,
    deckTitle: c.deck.title,
  });

  const strongCards = strongCardsRaw.map(mapCard);
  const struggleCards = struggleCardsRaw.map(mapCard);

  return {
    totalReviews: totalReviewEvents,
    easyTotal,
    hardTotal,
    last7Days,
    decksOwned,
    cardsMastered,
    cardsDue,
    // backwards compat — merge both lists
    topCards: [...strongCards, ...struggleCards].slice(0, 6),
    strongCards,
    struggleCards,
    masteryBreakdown,
    recentActivity: recentLogs.map((r) => ({
      at: r.createdAt.toISOString(),
      outcome: r.outcome,
      questionSnippet: r.flashcard.question.slice(0, 72) + (r.flashcard.question.length > 72 ? '…' : ''),
      deckTitle: r.flashcard.deck.title,
    })),
  };
}
