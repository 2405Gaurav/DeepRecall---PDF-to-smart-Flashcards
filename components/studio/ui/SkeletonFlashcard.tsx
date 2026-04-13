'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

/**
 * Shimmer placeholder for a flashcard while the deck is still being generated.
 * Matches the FlashcardItem layout so cards pop in seamlessly.
 */
export function SkeletonFlashcard({ index, delay = 0 }: { index: number; delay?: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="relative overflow-hidden border-lab-line/60 bg-white/80 p-4 shadow-sm">
        {/* shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, transparent 0%, rgba(15,118,110,0.06) 40%, rgba(15,118,110,0.10) 50%, rgba(15,118,110,0.06) 60%, transparent 100%)',
          }}
        />

        {/* top row — index + mastery badge */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-lab-teal/40">{index + 1}</span>
            <div className="h-4 w-14 rounded-full bg-lab-line/25" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 rounded bg-lab-line/20" />
            <div className="h-3 w-6 rounded bg-lab-line/15" />
            <div className="h-3 w-6 rounded bg-lab-line/15" />
          </div>
        </div>

        {/* question / answer columns */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="text-[10px] font-bold text-lab-teal/30">Question</span>
            <div className="mt-1.5 space-y-1.5">
              <div className="h-3.5 w-full rounded bg-lab-line/20" />
              <div className="h-3.5 w-4/5 rounded bg-lab-line/15" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-lab-soft/30">Answer</span>
            <div className="mt-1.5 space-y-1.5">
              <div className="h-3.5 w-full rounded bg-lab-line/15" />
              <div className="h-3.5 w-3/4 rounded bg-lab-line/12" />
              <div className="h-3.5 w-5/6 rounded bg-lab-line/10" />
            </div>
          </div>
        </div>
      </Card>
    </motion.li>
  );
}
