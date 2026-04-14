/**
 * Spaced repetition & mastery — personalized SM-2-inspired system.
 *
 * KEY FEATURES:
 * 1. Difficulty memory: cards with hardCount >= 3 are "struggle cards" (halved interval growth)
 * 2. Easy acceleration: cards with easyCount >= 4 and hardCount === 0 grow intervals 1.5x faster
 * 3. Four mastery levels with clear thresholds:
 *    - NEW: never reviewed
 *    - LEARNING: reviewed but interval < 4 days
 *    - FAMILIAR: interval 4–14 days
 *    - MASTERED: interval > 14 days AND last rating was not hard
 * 4. Review queue ordering: overdue first → LEARNING due → FAMILIAR due → NEW (max 10 new/session)
 * 5. Session capped at 20 cards to prevent overwhelming
 */
import { ML, RO, type MasteryLevelLiteral, type ReviewOutcomeLiteral } from '@/lib/db-enums';

export const MAX_INTERVAL_DAYS = 365;
export const MAX_SESSION_CARDS = 20;
export const MAX_NEW_PER_SESSION = 10;

export function addUtcDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function clampInterval(days: number): number {
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(days)));
}

/**
 * Determine mastery level from the user's explicit outcome choice.
 *
 * The user's self-assessment IS the mastery level — not the interval.
 * Intervals control *when* a card comes back (scheduling), but the
 * mastery label should match what the user actually selected:
 *   - "I've got it!" (MASTERED/EASY) → MASTERED
 *   - "Getting there" (FAMILIAR)     → FAMILIAR
 *   - "Still learning" (LEARNING/HARD) → LEARNING
 *
 * This keeps the studio deck list, profile page, and practice session
 * all showing the same consistent status for each card.
 */
function computeMasteryLevel(
  _interval: number,
  wasHard: boolean,
  outcome?: ReviewOutcomeLiteral,
): MasteryLevelLiteral {
  // hard/learning outcomes always stay at LEARNING
  if (wasHard) return ML.LEARNING;

  // direct mapping from user intent to mastery level
  if (outcome === RO.MASTERED || outcome === RO.EASY) return ML.MASTERED;
  if (outcome === RO.FAMILIAR) return ML.FAMILIAR;

  // fallback for LEARNING or undefined
  return ML.LEARNING;
}

export interface ReviewPlan {
  masteryLevel: MasteryLevelLiteral;
  interval: number;
  nextReview: Date;
  difficulty: 'EASY' | 'HARD' | 'NONE';
  easyInc: boolean;
  hardInc: boolean;
  // session summary fields
  isStruggleCard: boolean;
  previousMasteryLevel: string;
  updatedMasteryLevel: string;
  intervalDays: number;
  nextReviewDate: string;
}

export function planReviewUpdate(
  outcome: ReviewOutcomeLiteral,
  card: {
    interval: number;
    masteryLevel: string;
    easyCount: number;
    hardCount: number;
  }
): ReviewPlan {
  const now = new Date();
  const isStruggle = card.hardCount >= 3;
  const isEasyCard = card.easyCount >= 4 && card.hardCount === 0;
  const previousMasteryLevel = card.masteryLevel;

  let interval: number;
  let wasHard = false;

  switch (outcome) {
    case RO.LEARNING:
    case RO.HARD: {
      // hard/struggle: come back in 1 day, stay in LEARNING
      interval = 1;
      wasHard = true;
      break;
    }
    case RO.FAMILIAR: {
      // moderate: grow interval gently
      let growth = Math.max(3, Math.ceil(card.interval * 1.5));
      if (isStruggle) growth = Math.max(2, Math.ceil(growth * 0.5)); // halved for struggle
      if (isEasyCard) growth = Math.ceil(growth * 1.5); // accelerated for easy
      interval = clampInterval(growth);
      break;
    }
    case RO.EASY:
    case RO.MASTERED: {
      // success: expand interval significantly
      let base: number;
      if (card.masteryLevel === ML.NEW || card.masteryLevel === ML.LEARNING) {
        base = Math.max(3, card.interval * 2);
      } else if (card.masteryLevel === ML.FAMILIAR) {
        base = Math.max(7, Math.round(card.interval * 2.45));
      } else {
        base = Math.max(7, Math.round(card.interval * 2.45));
      }
      if (isStruggle) base = Math.max(2, Math.ceil(base * 0.5)); // halved
      if (isEasyCard) base = Math.ceil(base * 1.5); // accelerated
      interval = clampInterval(base);
      break;
    }
  }

  const masteryLevel = computeMasteryLevel(interval, wasHard, outcome);

  return {
    masteryLevel,
    interval,
    nextReview: addUtcDays(now, interval),
    difficulty: wasHard ? 'HARD' : (outcome === RO.EASY || outcome === RO.MASTERED || outcome === RO.FAMILIAR) ? 'EASY' : 'NONE',
    easyInc: !wasHard,
    hardInc: wasHard,
    // session summary
    isStruggleCard: isStruggle || (wasHard && card.hardCount >= 2),
    previousMasteryLevel,
    updatedMasteryLevel: masteryLevel,
    intervalDays: interval,
    nextReviewDate: addUtcDays(now, interval).toISOString(),
  };
}

type ReviewSortable = {
  nextReview: Date;
  lastReviewed: Date | null;
  createdAt: Date;
  masteryLevel: string;
};

/**
 * Prioritized review queue:
 * 1. Cards overdue by most days (most urgent)
 * 2. LEARNING cards due today
 * 3. FAMILIAR cards due today  
 * 4. NEW cards (max 10 per session)
 * Capped at MAX_SESSION_CARDS total
 */
export function sortFlashcardsForReviewQueue<T extends ReviewSortable>(cards: T[], now: Date): T[] {
  const t = now.getTime();

  const overdue: T[] = [];
  const learningDue: T[] = [];
  const familiarDue: T[] = [];
  const newCards: T[] = [];
  const upcoming: T[] = [];

  for (const c of cards) {
    const isDue = c.nextReview.getTime() <= t;

    if (isDue) {
      if (c.masteryLevel === ML.LEARNING) {
        learningDue.push(c);
      } else if (c.masteryLevel === ML.FAMILIAR || c.masteryLevel === ML.MASTERED) {
        overdue.push(c);
      } else {
        // NEW cards that are due
        newCards.push(c);
      }
    } else {
      upcoming.push(c);
    }
  }

  // sort overdue by how far overdue (most overdue first)
  overdue.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
  learningDue.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
  // cap new cards to max 10 per session
  const cappedNew = newCards.slice(0, MAX_NEW_PER_SESSION);

  const queue = [...overdue, ...learningDue, ...familiarDue, ...cappedNew];

  // if still under cap, add some upcoming
  if (queue.length < MAX_SESSION_CARDS) {
    upcoming.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
    queue.push(...upcoming.slice(0, MAX_SESSION_CARDS - queue.length));
  }

  return queue.slice(0, MAX_SESSION_CARDS);
}
