import { prisma } from '@/lib/prisma';
import { MASTER_INTERVAL_THRESHOLD } from '@/lib/deck-stats';

export type UserAnalyticsPayload = {
  totalReviews: number;
  easyTotal: number;
  hardTotal: number;
  last7Days: { day: string; count: number; easy: number; hard: number }[];
  decksOwned: number;
  cardsMastered: number;
  cardsDue: number;
  topCards: {
    id: string;
    question: string;
    easyCount: number;
    hardCount: number;
    deckTitle: string;
  }[];
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

  const [logs, topCardsRaw, decksOwned, totalAgg] = await Promise.all([
    prisma.reviewLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true, outcome: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.flashcard.findMany({
      where: { deck: { userId } },
      orderBy: [{ easyCount: 'desc' }, { hardCount: 'desc' }],
      take: 6,
      select: {
        id: true,
        question: true,
        easyCount: true,
        hardCount: true,
        deck: { select: { title: true } },
      },
    }),
    prisma.deck.count({ where: { userId } }),
    prisma.reviewLog.groupBy({
      by: ['outcome'],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const dayBuckets = new Map<string, { count: number; easy: number; hard: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    dayBuckets.set(dayKey(d), { count: 0, easy: 0, hard: 0 });
  }
  for (const log of logs) {
    const k = dayKey(log.createdAt);
    if (!dayBuckets.has(k)) continue;
    const b = dayBuckets.get(k)!;
    b.count += 1;
    if (log.outcome === 'EASY') b.easy += 1;
    else b.hard += 1;
  }

  const last7Days = Array.from(dayBuckets.entries()).map(([day, v]) => ({
    day,
    ...v,
  }));

  let cardsMastered = 0;
  let cardsDue = 0;
  if (deckIds.length) {
    const [m, d] = await Promise.all([
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, interval: { gt: MASTER_INTERVAL_THRESHOLD } },
      }),
      prisma.flashcard.count({
        where: { deckId: { in: deckIds }, nextReview: { lte: now } },
      }),
    ]);
    cardsMastered = m;
    cardsDue = d;
  }

  const easyTotal = totalAgg.find((x) => x.outcome === 'EASY')?._count._all ?? 0;
  const hardTotal = totalAgg.find((x) => x.outcome === 'HARD')?._count._all ?? 0;

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

  return {
    totalReviews: easyTotal + hardTotal,
    easyTotal,
    hardTotal,
    last7Days,
    decksOwned,
    cardsMastered,
    cardsDue,
    topCards: topCardsRaw.map((c) => ({
      id: c.id,
      question: c.question,
      easyCount: c.easyCount,
      hardCount: c.hardCount,
      deckTitle: c.deck.title,
    })),
    recentActivity: recentLogs.map((r) => ({
      at: r.createdAt.toISOString(),
      outcome: r.outcome,
      questionSnippet: r.flashcard.question.slice(0, 72) + (r.flashcard.question.length > 72 ? '…' : ''),
      deckTitle: r.flashcard.deck.title,
    })),
  };
}
