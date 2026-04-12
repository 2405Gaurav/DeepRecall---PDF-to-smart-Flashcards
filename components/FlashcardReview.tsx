/**
 * Legacy client review UI (Easy/Hard only). Studio uses `PracticeSession` + full outcomes;
 * scheduling lives in `lib/spaced-repetition.ts`.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  PartyPopper,
} from 'lucide-react';
import type { ReviewFlashcard } from '@/lib/types';
import { cn } from '@/lib/utils';

const typeLabels: Record<string, string> = {
  CONCEPT: 'Concept',
  DEFINITION: 'Definition',
  EXAMPLE: 'Example',
};

interface FlashcardReviewProps {
  flashcards: ReviewFlashcard[];
  onDifficultyUpdate?: (id: string, outcome: 'EASY' | 'HARD') => void;
}

export function FlashcardReview({ flashcards, onDifficultyUpdate }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulties, setDifficulties] = useState<Record<string, 'EASY' | 'HARD' | 'NONE'>>(() =>
    Object.fromEntries(flashcards.map((f) => [f.id, f.difficulty]))
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const current = flashcards[currentIndex];
  const total = flashcards.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const easyCount = Object.values(difficulties).filter((d) => d === 'EASY').length;
  const hardCount = Object.values(difficulties).filter((d) => d === 'HARD').length;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < flashcards.length - 1 ? i + 1 : i));
    setShowAnswer(false);
  }, [flashcards.length]);

  const goPrev = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
    setShowAnswer(false);
  };

  const handleOutcome = useCallback(
    async (outcome: 'EASY' | 'HARD') => {
      const card = flashcards[currentIndex];
      if (!card || isUpdating) return;
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/flashcard/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ outcome }),
      });
        if (res.ok) {
          setDifficulties((prev) => ({ ...prev, [card.id]: outcome }));
          onDifficultyUpdate?.(card.id, outcome);
          if (currentIndex < flashcards.length - 1) {
            setTimeout(() => {
              setCurrentIndex((i) => i + 1);
              setShowAnswer(false);
            }, 280);
          }
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [flashcards, currentIndex, isUpdating, onDifficultyUpdate]
  );

  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const deckSignature = flashcards.map((f) => f.id).join('|');
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setDifficulties(Object.fromEntries(flashcards.map((f) => [f.id, f.difficulty])));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when card set identity changes
  }, [deckSignature]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setShowAnswer(true);
        return;
      }
      if (!showAnswer) return;
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        void handleOutcome('EASY');
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        void handleOutcome('HARD');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAnswer, handleOutcome]);

  if (total === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-2xl border border-emerald-100 bg-emerald-50/50 p-10 text-center">
        <PartyPopper className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <p className="text-lg font-semibold text-slate-800">You&apos;re all caught up</p>
        <p className="text-sm text-slate-600 mt-2">
          No cards are due for review right now. Come back later or upload another PDF to keep learning.
        </p>
      </div>
    );
  }

  if (!current) return null;

  const currentDifficulty = difficulties[current.id];
  const cardTypeLabel = current.cardType ? typeLabels[current.cardType] ?? 'Card' : null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="font-medium">
          Card {currentIndex + 1} of {total}
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            {easyCount} Easy
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <XCircle className="w-4 h-4" />
            {hardCount} Hard
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-slate-900 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        key={current.id}
        className={cn(
          'relative min-h-[320px] rounded-2xl border-2 p-8 flex flex-col transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-1',
          currentDifficulty === 'EASY' && 'border-emerald-200 bg-emerald-50/30',
          currentDifficulty === 'HARD' && 'border-rose-200 bg-rose-50/30',
          currentDifficulty === 'NONE' && 'border-slate-200 bg-white'
        )}
      >
        {cardTypeLabel && (
          <span className="absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {cardTypeLabel}
          </span>
        )}

        {currentDifficulty !== 'NONE' && (
          <div
            className={cn(
              'absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full',
              currentDifficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            )}
          >
            {currentDifficulty}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question</span>
            <p className="mt-2 text-xl font-semibold text-slate-800 leading-relaxed">{current.question}</p>
          </div>

          {showAnswer ? (
            <div className="border-t border-slate-200 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Answer</span>
              <p className="mt-2 text-lg text-slate-700 leading-relaxed">{current.answer}</p>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Reveal Answer
                <span className="text-slate-400 font-normal">(Space)</span>
              </button>
            </div>
          )}
        </div>

        {showAnswer && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleOutcome('HARD')}
              disabled={isUpdating}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150',
                currentDifficulty === 'HARD'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
              )}
            >
              <XCircle className="w-4 h-4" />
              Hard (H)
            </button>
            <button
              type="button"
              onClick={() => handleOutcome('EASY')}
              disabled={isUpdating}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150',
                currentDifficulty === 'EASY'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              Easy (E)
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Shortcuts: Space reveal · E easy · H hard (after answer is shown)
      </p>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {currentIndex === total - 1 && showAnswer && (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <p className="font-semibold text-slate-700 mb-1">Session complete!</p>
          <p className="text-sm text-slate-500">
            {easyCount} easy &middot; {hardCount} hard &middot; {total - easyCount - hardCount} unrated
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Review again
          </button>
        </div>
      )}
    </div>
  );
}
