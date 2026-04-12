/**
 * Streak tracking & badge awarding logic.
 *
 * How streaks work:
 *  - A "practice day" = any day where the user reviewd at least 1 card.
 *  - If the user practices today and last_practice_date is yesterday → streak increments.
 *  - If last_practice_date is today → no change (already counted).
 *  - If last_practice_date is older than yesterday → streak resets to 1.
 *
 * Badges are awarded automaticaly when streak milestones are hit.
 */

import { prisma } from '@/lib/prisma';

// badge definitions — milestones that earn achievements
export const BADGE_DEFS = [
  { streak: 3,   slug: 'streak-3',   title: 'Getting Started',   emoji: '🌱', description: '3 days in a row — you\'re building a habit!' },
  { streak: 5,   slug: 'streak-5',   title: 'Warming Up',        emoji: '🔥', description: '5-day streak! Your brain is loving this.' },
  { streak: 7,   slug: 'streak-7',   title: 'One Week Strong',   emoji: '⭐', description: 'A full week of practice — impressive!' },
  { streak: 10,  slug: 'streak-10',  title: 'Double Digits',     emoji: '💪', description: '10 days strong — you\'re on fire!' },
  { streak: 15,  slug: 'streak-15',  title: 'Half-Month Hero',   emoji: '🏅', description: '15 days! You\'re in the top learners now.' },
  { streak: 21,  slug: 'streak-21',  title: 'Habit Formed',      emoji: '🧠', description: '21 days — scientists say this is when habits stick!' },
  { streak: 30,  slug: 'streak-30',  title: 'Monthly Master',    emoji: '🏆', description: 'An entire month of daily practice. Legend!' },
  { streak: 50,  slug: 'streak-50',  title: 'Unstoppable',       emoji: '🚀', description: '50 days — you\'re genuinely unstoppable!' },
  { streak: 100, slug: 'streak-100', title: 'Century Club',      emoji: '👑', description: '100 days in a row. You are a champion.' },
] as const;

// also have non-streak badges for total practice days (no conseccutive requirement)
export const TOTAL_DAY_BADGES = [
  { days: 10,  slug: 'days-10',  title: 'Dedicated Learner',  emoji: '📘', description: 'Practiced on 10 different days — great dedication!' },
  { days: 25,  slug: 'days-25',  title: 'Knowledge Seeker',   emoji: '🔬', description: '25 practice sessions — you\'re a pro!' },
  { days: 50,  slug: 'days-50',  title: 'Study Champion',     emoji: '🎯', description: '50 practice days — your growth is amazing!' },
  { days: 100, slug: 'days-100', title: 'Century Scholar',    emoji: '💎', description: '100 practice days. A rare achievement!' },
] as const;

function utcDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayUtc(): string {
  return utcDateStr(new Date());
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDateStr(d);
}

export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  newBadges: { slug: string; title: string; emoji: string; description: string }[];
};

/**
 * Call this when a user reviews a card. It updates their streak
 * and awards any newly-earned badges. Returns the updated streak info.
 */
export async function recordPracticeDay(userId: string): Promise<StreakResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastPracticeDate: true,
      totalPracticeDays: true,
    },
  });

  if (!user) throw new Error('User not found');

  const today = todayUtc();
  const lastDay = user.lastPracticeDate ? utcDateStr(user.lastPracticeDate) : null;

  // already practiced today — no change needed
  if (lastDay === today) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalPracticeDays: user.totalPracticeDays,
      newBadges: [],
    };
  }

  const yesterday = yesterdayUtc();
  let newStreak: number;
  let newTotal = user.totalPracticeDays + 1;

  if (lastDay === yesterday) {
    // consecutive day — add to streak
    newStreak = user.currentStreak + 1;
  } else {
    // streak broken or first time — start fresh
    newStreak = 1;
  }

  const newLongest = Math.max(user.longestStreak, newStreak);

  // update user in the database
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: new Date(),
      totalPracticeDays: newTotal,
    },
  });

  // check which badges should be awarded
  const newBadges: StreakResult['newBadges'] = [];

  // streak-based badges
  for (const def of BADGE_DEFS) {
    if (newStreak >= def.streak) {
      try {
        await prisma.badge.create({
          data: {
            userId,
            slug: def.slug,
            title: def.title,
            description: def.description,
            emoji: def.emoji,
          },
        });
        newBadges.push({ slug: def.slug, title: def.title, emoji: def.emoji, description: def.description });
      } catch {
        // unique constraint violation = already has this badge, skip
      }
    }
  }

  // total-days-based badges
  for (const def of TOTAL_DAY_BADGES) {
    if (newTotal >= def.days) {
      try {
        await prisma.badge.create({
          data: {
            userId,
            slug: def.slug,
            title: def.title,
            description: def.description,
            emoji: def.emoji,
          },
        });
        newBadges.push({ slug: def.slug, title: def.title, emoji: def.emoji, description: def.description });
      } catch {
        // already has it
      }
    }
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    totalPracticeDays: newTotal,
    newBadges,
  };
}

export type UserStreakPayload = {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  practicedToday: boolean;
  badges: { slug: string; title: string; emoji: string; description: string; unlockedAt: string }[];
  // upcoming badge target — the next milestone they havent earned
  nextBadge: { streak: number; title: string; emoji: string } | null;
};

/**
 * Fetch streak info + all badges for a user — used in the UI to render the badge wall
 */
export async function getUserStreak(userId: string): Promise<UserStreakPayload> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      totalPracticeDays: true,
      lastPracticeDate: true,
      badges: {
        orderBy: { unlockedAt: 'asc' },
        select: { slug: true, title: true, emoji: true, description: true, unlockedAt: true },
      },
    },
  });

  if (!user) throw new Error('User not found');

  const today = todayUtc();
  const lastDay = user.lastPracticeDate ? utcDateStr(user.lastPracticeDate) : null;
  const practicedToday = lastDay === today;

  // figure out the actual current streak (might be broken if they didn't practice yesterday)
  let displayStreak = user.currentStreak;
  if (!practicedToday && lastDay !== yesterdayUtc()) {
    // streak is broken but hasn't been reset yet in the DB
    displayStreak = 0;
  }

  // find next badge they haven't earned yet
  const earnedSlugs = new Set(user.badges.map((b) => b.slug));
  const nextStreakBadge = BADGE_DEFS.find((d) => !earnedSlugs.has(d.slug));
  const nextBadge = nextStreakBadge
    ? { streak: nextStreakBadge.streak, title: nextStreakBadge.title, emoji: nextStreakBadge.emoji }
    : null;

  return {
    currentStreak: displayStreak,
    longestStreak: user.longestStreak,
    totalPracticeDays: user.totalPracticeDays,
    practicedToday,
    badges: user.badges.map((b) => ({
      slug: b.slug,
      title: b.title,
      emoji: b.emoji,
      description: b.description,
      unlockedAt: b.unlockedAt.toISOString(),
    })),
    nextBadge,
  };
}
