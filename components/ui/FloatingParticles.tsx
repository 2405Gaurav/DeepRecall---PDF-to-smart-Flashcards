'use client';

import { motion } from 'framer-motion';

// playful floating shapes that drift around — nice ambient background for kids
const FLOATING_ITEMS = [
  { emoji: '📘', x: '8%', y: '15%', size: 28, delay: 0, duration: 6 },
  { emoji: '✨', x: '85%', y: '10%', size: 22, delay: 0.8, duration: 5.5 },
  { emoji: '🧠', x: '72%', y: '65%', size: 24, delay: 1.2, duration: 7 },
  { emoji: '🎯', x: '15%', y: '70%', size: 26, delay: 0.4, duration: 6.5 },
  { emoji: '⭐', x: '90%', y: '45%', size: 20, delay: 1.6, duration: 5 },
  { emoji: '📝', x: '5%', y: '45%', size: 22, delay: 2.0, duration: 6.8 },
  { emoji: '🏆', x: '50%', y: '8%', size: 24, delay: 0.6, duration: 5.8 },
  { emoji: '💡', x: '60%', y: '75%', size: 20, delay: 1.8, duration: 6.2 },
  { emoji: '🔬', x: '30%', y: '85%', size: 22, delay: 2.4, duration: 7.2 },
  { emoji: '🎨', x: '78%', y: '30%', size: 18, delay: 1.0, duration: 5.5 },
];

export function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLOATING_ITEMS.map((item, i) => (
        <motion.span
          key={i}
          className="absolute select-none opacity-20"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
          }}
          animate={{
            y: [0, -18, 0, 12, 0],
            x: [0, 8, -6, 4, 0],
            rotate: [0, 8, -5, 3, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  );
}

// smaller set for inside cards / practice screens
const MINI_ITEMS = [
  { emoji: '✨', x: '10%', y: '20%', size: 14, delay: 0, duration: 4 },
  { emoji: '⭐', x: '85%', y: '15%', size: 12, delay: 0.5, duration: 3.5 },
  { emoji: '💫', x: '75%', y: '70%', size: 14, delay: 1.0, duration: 4.5 },
  { emoji: '🌟', x: '20%', y: '75%', size: 12, delay: 1.5, duration: 3.8 },
];

export function MiniParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {MINI_ITEMS.map((item, i) => (
        <motion.span
          key={i}
          className="absolute select-none opacity-15"
          style={{ left: item.x, top: item.y, fontSize: item.size }}
          animate={{
            y: [0, -10, 0, 8, 0],
            rotate: [0, 15, -10, 5, 0],
            opacity: [0.15, 0.3, 0.15, 0.25, 0.15],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  );
}
