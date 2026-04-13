'use client';

import { motion } from 'framer-motion';
import { BadgeWall, StreakBanner } from '@/components/ui/BadgeDisplay';
import type { UserStreakPayload } from '@/lib/streaks';

interface StreakSectionProps {
  streakData: UserStreakPayload | null;
  emptyQuote: string;
}

/**
 * Right-column section on the profile page:
 * - Streak compact banner (or skeleton)
 * - Badges card with earned list or joyful empty state
 */
export function StreakSection({ streakData, emptyQuote }: StreakSectionProps) {
  return (
    <div className="flex flex-col gap-4">

      {/* Streak banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, type: 'tween' }}
      >
        {streakData ? (
          <StreakBanner data={streakData} compact />
        ) : (
          <div className="h-[72px] animate-pulse rounded-2xl bg-gradient-to-r from-orange-200 to-amber-200" />
        )}
      </motion.div>

      {/* Badges card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, type: 'tween' }}
        className="rounded-2xl border border-lab-line/70 bg-white/95 p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🏅</span>
          <h2 className="font-display text-base font-bold text-lab-ink">Badges</h2>
          {streakData && streakData.badges.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {streakData.badges.length} earned
            </span>
          )}
        </div>

        {streakData ? (
          streakData.badges.length > 0 ? (
            <BadgeWall badges={streakData.badges} variant="compact" />
          ) : (
            <motion.div
              className="rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 px-4 py-6 text-center shadow-sm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'tween' }}
            >
              <motion.span
                className="block text-4xl"
                animate={{ y: [0, -8] }}
                transition={{ duration: 0.9, repeat: Infinity, repeatType: 'mirror', type: 'tween', ease: 'easeInOut' }}
              >
                🎖️
              </motion.span>
              <p className="mt-3 text-sm font-bold text-white">No badges yet!</p>
              <p className="mx-auto mt-1 max-w-[200px] text-xs text-indigo-100">{emptyQuote}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                <span>🌱</span><span>3 days = first badge</span>
              </div>
            </motion.div>
          )
        ) : (
          <div className="h-28 animate-pulse rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100" />
        )}
      </motion.div>
    </div>
  );
}
