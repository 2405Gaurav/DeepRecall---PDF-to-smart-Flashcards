'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DeckCardRow } from '@/lib/types';

interface FlashcardItemProps {
  card: DeckCardRow;
  index: number;
  total: number;
  showAnswers: boolean;
  onReset: (id: string) => void;
}

const MASTERY_STYLES: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'New', cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  LEARNING: { label: 'Learning', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  FAMILIAR: { label: 'Familiar', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  MASTERED: { label: 'Mastered', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

/** Single flashcard row shown in the deck detail view. */
export function FlashcardItem({ card, index, total, showAnswers, onReset }: FlashcardItemProps) {
  const mastery = MASTERY_STYLES[card.masteryLevel] ?? MASTERY_STYLES.NEW;
  const nextDate = card.nextReview
    ? new Date(card.nextReview).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '—';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], type: 'tween' }}
    >
      <Card className="border-lab-line/80 bg-white/95 p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-lab-teal">{index + 1}/{total}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${mastery.cls}`}>
              {mastery.label}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[10px] text-lab-soft">
            <span title="Next review">📅 {nextDate}</span>
            <span className="text-emerald-600">{card.easyCount ?? 0}✓</span>
            <span className="text-orange-600">{card.hardCount ?? 0}✗</span>
            <button
              type="button"
              onClick={() => onReset(card.id)}
              className="rounded p-0.5 transition hover:bg-red-50 hover:text-red-600"
              title="Reset to NEW"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="text-[10px] font-bold text-lab-teal">Question</span>
            <p className="mt-0.5 text-sm leading-snug text-lab-ink">{card.question}</p>
          </div>
          <div className={cn(!showAnswers && 'relative select-none')}>
            <span className="text-[10px] font-bold uppercase tracking-wide text-lab-soft">Answer</span>
            <p className={cn('mt-0.5 text-sm leading-snug text-lab-ink/90 transition', !showAnswers && 'blur-md')}>
              {card.answer}
            </p>
            {!showAnswers && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/35">
                <EyeOff className="h-6 w-6 text-lab-line" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.li>
  );
}

/** Toggle button for show/hide answers */
export function ShowAnswersToggle({
  showAnswers,
  onToggle,
}: {
  showAnswers: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-xl border border-lab-line/90 bg-white/90 px-4 py-2 text-sm font-semibold text-lab-ink shadow-sm transition hover:bg-lab-mint/30"
    >
      {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      {showAnswers ? 'Hide' : 'Show'} answers
    </button>
  );
}
