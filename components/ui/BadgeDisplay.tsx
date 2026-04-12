'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { UserStreakPayload } from '@/lib/streaks';

// container variants for staggered badge entrance
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const badgeItem = {
  hidden: { opacity: 0, scale: 0.5, y: 15 },
  show: { opacity: 1, scale: 1, y: 0 },
};

type StreakData = UserStreakPayload;

interface StreakBannerProps {
  data: StreakData;
  compact?: boolean;
}

/**
 * The main streak banner — shows current streak, best streak, and practice days.
 * Compact mode for embedding inside other cards (like studio header).
 */
export function StreakBanner({ data, compact = false }: StreakBannerProps) {
  const { currentStreak, longestStreak, totalPracticeDays, practicedToday, nextBadge } = data;
  const zeroStateQuote = 'Finish one full flashcard session today and your streak starts here.';

  // pick flame level based on streak length
  const flameEmoji = currentStreak >= 30 ? '🔥' : currentStreak >= 15 ? '🔥' : currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '🔥' : '✨';
  const flameSize = currentStreak >= 30 ? 'text-4xl' : currentStreak >= 15 ? 'text-3xl' : currentStreak >= 7 ? 'text-2xl' : 'text-xl';

  if (compact) {
    return (
      <motion.div
        className="rounded-2xl border border-lab-line/70 bg-white/90 px-4 py-4 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <motion.span
          className={`${flameSize} select-none`}
          animate={currentStreak >= 3 ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {flameEmoji}
        </motion.span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-lab-ink">
            {currentStreak > 0 ? `${currentStreak}-day streak` : 'Start a streak!'}
          </p>
          <p className="text-xs text-lab-soft">
            {practicedToday ? '✅ Practiced today' : '⏳ Practice today to keep it!'}{' '}
            · Best: {longestStreak}d
          </p>
        </div>
        {nextBadge && (
          <div className="ml-auto text-right">
            <p className="text-xs text-lab-soft">Next badge</p>
            <p className="text-sm font-bold text-lab-teal-dark">
              {nextBadge.emoji} {nextBadge.streak}d
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl border border-lab-line/70 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-wrap items-start gap-5">
        {/* big streak number */}
        <motion.div
          className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 shadow-sm"
          animate={currentStreak >= 3 ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className={`${flameSize} select-none leading-none`}
            animate={currentStreak >= 3 ? { rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
          >
            {flameEmoji}
          </motion.span>
          <span className="mt-0.5 text-lg font-black text-orange-700">{currentStreak}</span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold text-lab-ink sm:text-2xl">
            {currentStreak > 0 ? (
              <>
                {currentStreak}-day streak!{' '}
                {currentStreak >= 7 ? '🌟' : currentStreak >= 3 ? '⭐' : ''}
              </>
            ) : (
              'Start your streak today! 🚀'
            )}
          </h2>
          <p className="mt-1 text-sm text-lab-soft">
            {practicedToday
              ? "✅ You've already practiced today — come back tomorrow to extend it!"
              : '⏳ Practice at least one card today to keep your streak alive!'}
          </p>
        </div>
      </div>

      {/* stat pills */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatPill label="Current" value={`${currentStreak} day${currentStreak !== 1 ? 's' : ''}`} emoji="🔥" />
        <StatPill label="Best ever" value={`${longestStreak} day${longestStreak !== 1 ? 's' : ''}`} emoji="🏆" />
        <StatPill label="Total practice" value={`${totalPracticeDays} day${totalPracticeDays !== 1 ? 's' : ''}`} emoji="📚" />
      </div>

      {/* next badge progress */}
      {nextBadge && (
        <motion.div
          className="mt-5 flex items-center gap-3 rounded-xl border border-lab-teal/20 bg-lab-mint/30 px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-2xl">{nextBadge.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-lab-teal-dark">Next badge</p>
            <p className="text-sm font-bold text-lab-ink">{nextBadge.title}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-lab-teal-dark">
              {nextBadge.streak - currentStreak}
            </p>
            <p className="text-xs text-lab-soft">days to go</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatPill({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <motion.div
      className="rounded-xl border border-lab-line/50 bg-white/80 px-3 py-3 text-center"
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="block text-lg">{emoji}</span>
      <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-lab-soft">{label}</span>
      <span className="mt-0.5 block text-sm font-bold text-lab-ink">{value}</span>
    </motion.div>
  );
}

interface BadgeWallProps {
  badges: StreakData['badges'];
  className?: string;
}

/**
 * Grid display of all earned badges with staggered entrance animations
 */
export function BadgeWall({ badges, className = '' }: BadgeWallProps) {
  if (badges.length === 0) {
    return (
      <motion.div
        className={`rounded-2xl border border-dashed border-lab-line/60 bg-lab-mint/15 py-10 text-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.span
          className="block text-4xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎖️
        </motion.span>
        <p className="mt-3 text-sm font-semibold text-lab-ink">No badges yet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-lab-soft">
          Practice daily to earn streak badges! Start with 3 days in a row.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 ${className}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {badges.map((badge) => (
        <motion.div
          key={badge.slug}
          variants={badgeItem}
          whileHover={{ y: -4, scale: 1.05, rotate: Math.random() > 0.5 ? 2 : -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="group relative flex flex-col items-center rounded-xl border border-lab-line/60 bg-white/95 px-3 py-4 shadow-sm transition-shadow hover:shadow-md"
        >
          {/* badge emoji — bounces on hover */}
          <motion.span
            className="text-3xl select-none"
            whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {badge.emoji}
          </motion.span>
          <p className="mt-2 text-center text-xs font-bold text-lab-ink leading-snug">{badge.title}</p>
          <p className="mt-1 text-center text-[10px] text-lab-soft leading-snug">{badge.description}</p>
          <p className="mt-2 text-[9px] text-lab-soft/70">
            {new Date(badge.unlockedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface NewBadgeToastProps {
  badge: { emoji: string; title: string; description: string } | null;
  onDismiss: () => void;
}

/**
 * Full-screen celebration when a new badge is earned during practice
 */
export function NewBadgeCelebration({ badge, onDismiss }: NewBadgeToastProps) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            className="mx-4 max-w-sm rounded-2xl border-2 border-lab-teal/40 bg-white p-8 text-center shadow-2xl"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.span
              className="block text-6xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.8, repeat: 2 }}
            >
              {badge.emoji}
            </motion.span>
            <motion.p
              className="mt-3 text-xs font-bold uppercase tracking-widest text-lab-teal"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              New Badge Unlocked!
            </motion.p>
            <motion.h3
              className="mt-2 font-display text-2xl font-bold text-lab-ink"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {badge.title}
            </motion.h3>
            <motion.p
              className="mt-2 text-sm text-lab-soft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {badge.description}
            </motion.p>
            <motion.button
              type="button"
              onClick={onDismiss}
              className="mt-6 rounded-xl bg-lab-teal px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-lab-teal-dark"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Awesome! 🎉
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
