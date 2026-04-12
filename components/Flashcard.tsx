'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const typeLabels: Record<string, string> = {
  CONCEPT: 'Concept',
  DEFINITION: 'Definition',
  EXAMPLE: 'Example',
};

export interface FlashcardProps {
  question: string;
  answer: string;
  showAnswer: boolean;
  cardType: string;
  onReveal: () => void;
  footer?: ReactNode;
  highlight?: 'easy' | 'hard' | 'none';
}

export function Flashcard({
  question,
  answer,
  showAnswer,
  cardType,
  onReveal,
  footer,
  highlight = 'none',
}: FlashcardProps) {
  const label = typeLabels[cardType] || 'Card';

  return (
    <div
      className={cn(
        'relative min-h-[320px] rounded-2xl border-2 p-8 flex flex-col transition-all duration-300 ease-out',
        highlight === 'easy' && 'border-emerald-200 bg-emerald-50/40 shadow-sm',
        highlight === 'hard' && 'border-rose-200 bg-rose-50/40 shadow-sm',
        highlight === 'none' && 'border-slate-200 bg-white shadow-sm'
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</span>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question</span>
          <p className="mt-2 text-xl font-semibold text-slate-800 leading-relaxed">{question}</p>
        </div>

        {showAnswer ? (
          <div className="border-t border-slate-200 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Answer</span>
            <p className="mt-2 text-lg text-slate-700 leading-relaxed">{answer}</p>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onReveal}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Show answer <span className="text-slate-400 font-normal">(Space)</span>
            </button>
          </div>
        )}
      </div>

      {footer && <div className="mt-6 pt-6 border-t border-slate-200">{footer}</div>}
    </div>
  );
}
