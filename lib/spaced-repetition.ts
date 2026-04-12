/**
 * Spaced repetition & mastery — aligned with long-term retention over cramming.
 *
 * Policy (SM-2-inspired, simplified):
 * - Struggle (LEARNING / HARD) → short interval (1 day), card stays in the "learning" bucket.
 * - Partial success (FAMILIAR) → moderate growth (~1.5× previous days, floor 3).
 * - Success (EASY / MASTERED) → expand interval (≈2×–2.5×, floors for early mastery), capped so
 *   well-known cards fade from the queue without disappearing forever (max gap).
 * - Intervals are stored as whole days; `nextReview` is advanced from "now" at review time.
 *
 * See also: `sortFlashcardsForReviewQueue` — due cards first, most overdue first, then upcoming.
 */
import { ML, RO, type MasteryLevelLiteral, type ReviewOutcomeLiteral } from '@/lib/db-enums';

export const MAX_INTERVAL_DAYS = 365;
export const MIN_MASTER_INTERVAL_DAYS = 7;

export function addUtcDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function clampIntervalDays(days: number): number {
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(days)));
}

function growMasteredInterval(previous: number): number {
  const grown = Math.max(MIN_MASTER_INTERVAL_DAYS, Math.round(previous * 2.45));
  return clampIntervalDays(grown);
}

export function planReviewUpdate(
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
    case RO.FAMILIAR: {
      const days = Math.max(3, Math.ceil(card.interval * 1.5));
      return {
        masteryLevel: ML.FAMILIAR,
        interval: days,
        nextReview: addUtcDays(now, days),
        difficulty: 'EASY',
        easyInc: true,
        hardInc: false,
      };
    }
    case RO.EASY:
      if (card.masteryLevel === ML.NEW || card.masteryLevel === ML.LEARNING) {
        const days = Math.max(2, card.interval * 2);
        return {
          masteryLevel: ML.FAMILIAR,
          interval: days,
          nextReview: addUtcDays(now, days),
          difficulty: 'EASY',
          easyInc: true,
          hardInc: false,
        };
      }
      if (card.masteryLevel === ML.FAMILIAR) {
        const days = growMasteredInterval(card.interval);
        return {
          masteryLevel: ML.MASTERED,
          interval: days,
          nextReview: addUtcDays(now, days),
          difficulty: 'EASY',
          easyInc: true,
          hardInc: false,
        };
      }
      {
        const days = growMasteredInterval(card.interval);
        return {
          masteryLevel: ML.MASTERED,
          interval: days,
          nextReview: addUtcDays(now, days),
          difficulty: 'EASY',
          easyInc: true,
          hardInc: false,
        };
      }
    case RO.MASTERED: {
      const days = growMasteredInterval(card.interval);
      return {
        masteryLevel: ML.MASTERED,
        interval: days,
        nextReview: addUtcDays(now, days),
        difficulty: 'EASY',
        easyInc: true,
        hardInc: false,
      };
    }
  }
}

type ReviewSortable = {
  nextReview: Date;
  lastReviewed: Date | null;
  createdAt: Date;
};

/**
 * Order cards for study: everything due or overdue first (oldest due date first),
 * then not-yet-due (soonest next review first). No random shuffle — preserves scheduling intent.
 */
export function sortFlashcardsForReviewQueue<T extends ReviewSortable>(cards: T[], now: Date): T[] {
  const t = now.getTime();
  const due: T[] = [];
  const upcoming: T[] = [];
  for (const c of cards) {
    if (c.nextReview.getTime() <= t) due.push(c);
    else upcoming.push(c);
  }
  const cmp = (a: T, b: T) => {
    const n = a.nextReview.getTime() - b.nextReview.getTime();
    if (n !== 0) return n;
    const la = a.lastReviewed?.getTime() ?? 0;
    const lb = b.lastReviewed?.getTime() ?? 0;
    if (la !== lb) return la - lb;
    return a.createdAt.getTime() - b.createdAt.getTime();
  };
  due.sort(cmp);
  upcoming.sort(cmp);
  return [...due, ...upcoming];
}
