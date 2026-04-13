'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  pct: number;
}

/** Animated SVG progress ring with emoji centre for the deck detail page. */
export function ProgressRing({ pct }: ProgressRingProps) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, pct)) / 100);
  const emoji = pct >= 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '💪' : pct >= 25 ? '📈' : '🚀';

  return (
    <div className="relative">
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className="-rotate-90 shrink-0"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: -90 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
      >
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r={r} fill="none" className="stroke-lab-line/30" strokeWidth="7" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="7"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          strokeLinecap="round"
        />
      </motion.svg>
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300 }}
      >
        {emoji}
      </motion.span>
    </div>
  );
}
