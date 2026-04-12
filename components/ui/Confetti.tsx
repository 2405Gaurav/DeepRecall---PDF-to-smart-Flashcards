'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// confetti shapes — mix of circles, stars, and squares for a fun child-freindly look
const SHAPES = ['circle', 'star', 'square', 'triangle'] as const;
const COLORS = [
  '#0f766e', '#f97316', '#eab308', '#ec4899',
  '#8b5cf6', '#06b6d4', '#22c55e', '#f43f5e',
  '#3b82f6', '#a855f7', '#14b8a6', '#fb923c',
];

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: typeof SHAPES[number];
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  delay: number;
};

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 45 + Math.random() * 10, // cluster near center-ish
    y: 30 + Math.random() * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
    velocityX: (Math.random() - 0.5) * 120,
    velocityY: -(40 + Math.random() * 80),
    delay: Math.random() * 0.3,
  }));
}

function ShapeEl({ shape, color, size }: { shape: string; color: string; size: number }) {
  if (shape === 'circle') {
    return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />;
  }
  if (shape === 'star') {
    return (
      <span style={{ fontSize: size * 1.3, color, lineHeight: 1 }} aria-hidden>
        ⭐
      </span>
    );
  }
  if (shape === 'triangle') {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }}
      />
    );
  }
  // square
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.15,
        backgroundColor: color,
      }}
    />
  );
}

interface ConfettiProps {
  /** set to true to fire the confetti burst */
  active: boolean;
  /** how many pieces to spawn, defaults to 40 */
  count?: number;
  /** callback after confetti finishes */
  onComplete?: () => void;
}

export function Confetti({ active, count = 40, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      setParticles(generateParticles(count));
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2200);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [active, count, onComplete]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none fixed z-[100]"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.velocityX,
            y: [0, p.velocityY, p.velocityY + 200],
            rotate: p.rotation + 360,
            scale: [0, 1.2, 0.8],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.8,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ShapeEl shape={p.shape} color={p.color} size={p.size} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/**
 * Hook to fire confetti on demand — returns [fireConfetti, ConfettiOverlay]
 * Usage: const [fire, Overlay] = useConfetti(); ... fire(); ... <Overlay />
 */
export function useConfetti(particleCount = 40) {
  const [show, setShow] = useState(false);
  const fire = useCallback(() => setShow(true), []);
  const handleComplete = useCallback(() => setShow(false), []);

  const Overlay = useCallback(
    () => <Confetti active={show} count={particleCount} onComplete={handleComplete} />,
    [show, particleCount, handleComplete]
  );

  return [fire, Overlay] as const;
}
