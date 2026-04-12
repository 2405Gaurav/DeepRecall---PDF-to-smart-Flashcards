'use client';

import { motion } from 'framer-motion';

/**
 * CueMathLoader — a playful, child-friendly loading animation.
 * Use this throught the app wherever we need a loading state.
 *
 * Features:
 * - Bouncing emoji characters (books, brain, stars)
 * - Pulsing teal progress ring
 * - Rotating loading messages so kids stay entertained
 * - Multiple sizes: sm, md, lg
 */

const EMOJIS = ['📘', '🧠', '⭐', '✨', '🎯'];

const MESSAGES = [
  'Did you know? Spaced repetition can cut study time by 50%.',
  'The Ebbinghaus forgetting curve: you forget 70% within 24 hours without review.',
  'Active recall is 2x more effective than re-reading.',
  'Your cards are being prepared by an AI teacher right now.',
  'Testing yourself beats re-reading every time.',
  'Sleeping after studying helps memories consolidate.',
];

type LoaderSize = 'sm' | 'md' | 'lg';

interface CueMathLoaderProps {
  /** Custom message to show — overrides rotating messages */
  message?: string;
  /** Size variant */
  size?: LoaderSize;
  /** Additional class names */
  className?: string;
  /** If true, shows a full-screen overlay loader */
  fullScreen?: boolean;
}

const sizeConfig = {
  sm: { ring: 40, stroke: 4, emoji: 'text-xl', text: 'text-xs', gap: 'gap-2', py: 'py-4' },
  md: { ring: 56, stroke: 5, emoji: 'text-3xl', text: 'text-sm', gap: 'gap-3', py: 'py-8' },
  lg: { ring: 72, stroke: 6, emoji: 'text-4xl', text: 'text-base', gap: 'gap-4', py: 'py-12' },
};

function LoaderCore({ message, size = 'md' }: { message?: string; size?: LoaderSize }) {
  const cfg = sizeConfig[size];
  const r = (cfg.ring - cfg.stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className={`flex flex-col items-center ${cfg.gap}`}>
      {/* animated ring with bouncing emoji inside */}
      <div className="relative">
        <motion.svg
          width={cfg.ring}
          height={cfg.ring}
          viewBox={`0 0 ${cfg.ring} ${cfg.ring}`}
          className="-rotate-90"
          animate={{ rotate: [-90, 270] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <circle
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={r}
            fill="none"
            className="stroke-lab-line/30"
            strokeWidth={cfg.stroke}
          />
          <motion.circle
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={r}
            fill="none"
            stroke="url(#loader-grad)"
            strokeWidth={cfg.stroke}
            strokeDasharray={c}
            strokeDashoffset={c * 0.7}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* bouncing emoji in center */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${cfg.emoji} select-none`}
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -3, 0],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <EmojiCycler />
        </motion.div>
      </div>

      {/* loading message */}
      <motion.p
        className={`font-medium text-lab-soft ${cfg.text}`}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message || <MessageCycler />}
      </motion.p>

      {/* bouncing dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-lab-teal"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Cycles through emojis every 1.5s */
function EmojiCycler() {
  const [idx, setIdx] = useState(0);

  useEffectClient(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % EMOJIS.length), 1500);
    return () => clearInterval(t);
  });

  return (
    <motion.span
      key={idx}
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {EMOJIS[idx]}
    </motion.span>
  );
}

/** Cycles through messages every 3s */
function MessageCycler() {
  const [idx, setIdx] = useState(0);

  useEffectClient(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 3000);
    return () => clearInterval(t);
  });

  return (
    <motion.span
      key={idx}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {MESSAGES[idx]}
    </motion.span>
  );
}

// simple client-only effect to avoid SSR issues
import { useState, useEffect } from 'react';
function useEffectClient(fn: () => (() => void) | void) {
  useEffect(() => {
    return fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Main loader component — use this everywhere!
 */
export function CueMathLoader({ message, size = 'md', className = '', fullScreen = false }: CueMathLoaderProps) {
  if (fullScreen) {
    return (
      <div className={`flex min-h-[60vh] items-center justify-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LoaderCore message={message} size="lg" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${sizeConfig[size].py} ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoaderCore message={message} size={size} />
      </motion.div>
    </div>
  );
}

/**
 * Upload-specific loader with stage progression — used during PDF processing.
 * Shows a visually rich progress animation with rotating tips for kids.
 */
const UPLOAD_TIPS = [
  { emoji: '📖', tip: 'Reading your PDF page by page…' },
  { emoji: '🤖', tip: 'Your cards are being written by an AI teacher right now.' },
  { emoji: '🧠', tip: 'Did you know? Spaced repetition can cut study time by 50%.' },
  { emoji: '📊', tip: 'The Ebbinghaus forgetting curve shows you forget 70% within 24 hours without review.' },
  { emoji: '⚡', tip: 'Active recall is 2x more effective than re-reading.' },
  { emoji: '✨', tip: 'Great flashcards test understanding, not just memory.' },
  { emoji: '💾', tip: 'Saving your deck…' },
];

interface UploadLoaderProps {
  stage: string;
  fileName?: string;
}

export function UploadLoader({ stage, fileName }: UploadLoaderProps) {
  const [tipIdx, setTipIdx] = useState(0);

  useEffectClient(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % UPLOAD_TIPS.length), 4000);
    return () => clearInterval(t);
  });

  const tip = UPLOAD_TIPS[tipIdx];

  return (
    <motion.div
      className="flex flex-col items-center gap-4 px-4 py-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* animated progress ring */}
      <div className="relative">
        <motion.svg
          width={80}
          height={80}
          viewBox="0 0 80 80"
          className="-rotate-90"
        >
          <circle cx="40" cy="40" r="34" fill="none" className="stroke-violet-100" strokeWidth="6" />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="url(#upload-grad)"
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 34}
            strokeLinecap="round"
            animate={{
              strokeDashoffset: [2 * Math.PI * 34, 2 * Math.PI * 34 * 0.15],
            }}
            transition={{ duration: 25, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="upload-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
        </motion.svg>

        <motion.span
          className="absolute inset-0 flex items-center justify-center text-3xl"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {tip.emoji}
        </motion.span>
      </div>

      {/* current stage */}
      <div>
        <motion.p
          className="text-base font-semibold text-violet-800"
          key={stage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {stage || 'Working…'}
        </motion.p>
        {fileName && (
          <p className="mt-1 text-xs text-zinc-500">
            <span className="font-medium text-zinc-700">{fileName}</span>
          </p>
        )}
      </div>

      {/* rotating tips */}
      <motion.p
        key={tipIdx}
        className="max-w-xs text-xs text-zinc-400"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        💡 {tip.tip}
      </motion.p>

      {/* bouncing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-violet-400"
            animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.12,
            }}
          />
        ))}
      </div>

      <p className="text-[10px] text-zinc-400">Keep this tab open — it usually takes 15-30 seconds</p>
    </motion.div>
  );
}
