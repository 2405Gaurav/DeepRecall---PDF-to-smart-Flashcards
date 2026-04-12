'use client';

import { motion, AnimatePresence } from 'framer-motion';

// streak counter that pops up with enouraging messages when kids get cards right
const STREAK_MESSAGES = [
  '', // 0
  '', // 1
  '🔥 Nice!', // 2
  '🔥 On fire!', // 3
  '⚡ Awesome!', // 4
  '🌟 Superstar!', // 5
  '💎 Brilliant!', // 6
  '🚀 Unstoppable!', // 7
  '👑 Legend!', // 8
  '🏆 Champion!', // 9
  '✨ PERFECT RUN!', // 10+
];

function getMessage(streak: number): string {
  if (streak < 2) return '';
  if (streak >= STREAK_MESSAGES.length) return STREAK_MESSAGES[STREAK_MESSAGES.length - 1];
  return STREAK_MESSAGES[streak];
}

// the bouncy flame size scales up with streak
function flameScale(streak: number): number {
  if (streak < 2) return 0;
  return Math.min(1 + (streak - 2) * 0.08, 1.5);
}

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className = '' }: StreakCounterProps) {
  const msg = getMessage(streak);
  const scale = flameScale(streak);

  return (
    <AnimatePresence mode="wait">
      {streak >= 2 && (
        <motion.div
          key={`streak-${streak}`}
          className={`flex items-center gap-2 ${className}`}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {/* bouncy flame icon */}
          <motion.span
            className="text-xl select-none"
            animate={{
              scale: [scale, scale * 1.2, scale],
              rotate: [0, -8, 8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
          >
            🔥
          </motion.span>

          {/* streak number */}
          <motion.span
            className="text-sm font-black text-orange-600"
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {streak}
          </motion.span>

          {/* message */}
          <motion.span
            className="text-xs font-bold text-lab-ink"
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {msg}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 *  Mascot reaction — shows a big animated emoji face when certian thigns happen.
 *  'happy' for correct, 'think' for wrong, 'celebrate' for streak milestones
 */
type MascotMood = 'happy' | 'think' | 'celebrate' | 'idle';

const MOOD_EMOJI: Record<MascotMood, string> = {
  happy: '😄',
  think: '🤔',
  celebrate: '🥳',
  idle: '😊',
};

interface MascotProps {
  mood: MascotMood;
  className?: string;
}

export function Mascot({ mood, className = '' }: MascotProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood}
        className={`select-none text-3xl ${className}`}
        initial={{ scale: 0, rotate: -20 }}
        animate={{
          scale: 1,
          rotate: 0,
          y: mood === 'celebrate' ? [0, -8, 0] : 0,
        }}
        exit={{ scale: 0, rotate: 20 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
          y: mood === 'celebrate'
            ? { duration: 0.5, repeat: 2, ease: 'easeOut' }
            : undefined,
        }}
      >
        {MOOD_EMOJI[mood]}
      </motion.div>
    </AnimatePresence>
  );
}
