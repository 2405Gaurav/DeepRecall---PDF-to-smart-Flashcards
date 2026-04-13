'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DeckStatCardProps {
  label: string;
  count: number;
  pct: number;
  className: string;
  icon: ReactNode;
}

/** Mini mastery-state stat card used on the deck detail page. */
export function DeckStatCard({ label, count, pct, className, icon }: DeckStatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={cn('rounded-xl border px-2 py-2.5', className)}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-lg font-bold">{pct}%</p>
      <p className="text-[10px] opacity-80">{count} cards</p>
    </motion.div>
  );
}
