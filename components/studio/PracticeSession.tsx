'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Trophy } from 'lucide-react';
import type { ReviewFlashcard } from '@/lib/types';
import { cn } from '@/lib/utils';

type Outcome = 'LEARNING' | 'FAMILIAR' | 'MASTERED';

function mapCard(c: Record<string, unknown>): ReviewFlashcard {
  return {
    id: String(c.id),
    question: String(c.question),
    answer: String(c.answer),
    difficulty: (c.difficulty as ReviewFlashcard['difficulty']) ?? 'NONE',
    masteryLevel: (c.masteryLevel as ReviewFlashcard['masteryLevel']) ?? 'NEW',
    interval: Number(c.interval),
    nextReview:
      typeof c.nextReview === 'string' ? c.nextReview : new Date(c.nextReview as Date).toISOString(),
    lastReviewed: c.lastReviewed
      ? typeof c.lastReviewed === 'string'
        ? c.lastReviewed
        : new Date(c.lastReviewed as Date).toISOString()
      : null,
    deckId: String(c.deckId),
    createdAt:
      typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt as Date).toISOString(),
    cardType: c.cardType != null ? String(c.cardType) : undefined,
  };
}

export function PracticeSession({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState<ReviewFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deckRes, cardRes] = await Promise.all([
        fetch(`/api/decks/${deckId}`, { credentials: 'include' }),
        fetch(`/api/decks/${deckId}/review?scope=all`, { credentials: 'include' }),
      ]);
      const deckJson = await deckRes.json();
      const cardJson = await cardRes.json();
      if (!deckRes.ok) throw new Error(deckJson.error || 'Deck not found');
      if (!cardRes.ok) throw new Error(cardJson.error || 'Could not load cards');
      setTitle(deckJson.deck.title);
      const raw = cardJson.cards as Record<string, unknown>[];
      setCards(raw.map(mapCard));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = cards.length;
  const current = cards[index];
  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  const sendOutcome = async (outcome: Outcome) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/flashcard/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ outcome }),
      });
      if (!res.ok) return;
      if (index < total - 1) {
        setIndex((i) => i + 1);
        setShowAnswer(false);
      } else {
        router.push(`/studio/deck/${deckId}`);
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setShowAnswer(true);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
        setShowAnswer(false);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
        setShowAnswer(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">Loading…</div>
    );
  }

  if (error || !current) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error || 'No cards in this deck.'}</p>
        <Link href={`/studio/deck/${deckId}`} className="mt-4 inline-block text-sm font-semibold text-violet-600">
          ← Back to deck
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href={`/studio/deck/${deckId}`}
            className="text-xs font-semibold text-zinc-500 transition hover:text-violet-600"
          >
            ✕ Exit practice
          </Link>
          <p className="truncate text-center text-xs font-medium text-zinc-600">{title}</p>
          <span className="text-xs font-bold text-zinc-800">
            {index + 1}/{total}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: showAnswer ? 0 : -1.5 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'relative mx-auto w-full max-w-md rounded-2xl border-2 bg-white p-6 shadow-lg',
              showAnswer ? 'border-violet-200' : 'border-red-200/80'
            )}
          >
            <div className="pointer-events-none absolute -right-1 -z-10 h-full w-full translate-x-1 translate-y-2 rounded-2xl border border-zinc-100 bg-white shadow-sm" />
            <p className="text-center text-base font-medium leading-relaxed text-zinc-900 sm:text-lg">
              {showAnswer ? current.answer : current.question}
            </p>
            {!showAnswer && (
              <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Question
              </p>
            )}
            {showAnswer && (
              <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                Answer
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            <RatePill
              icon={<Flame className="h-4 w-4" />}
              label="Learning"
              sub="(1)"
              color="text-red-600 border-red-200 bg-red-50"
              onClick={() => void sendOutcome('LEARNING')}
              disabled={busy}
            />
            <RatePill
              icon={<TrendingUp className="h-4 w-4" />}
              label="Familiar"
              sub="(2)"
              color="text-amber-700 border-amber-200 bg-amber-50"
              onClick={() => void sendOutcome('FAMILIAR')}
              disabled={busy}
            />
            <RatePill
              icon={<Trophy className="h-4 w-4" />}
              label="Mastered"
              sub="(3)"
              color="text-emerald-700 border-emerald-200 bg-emerald-50"
              onClick={() => void sendOutcome('MASTERED')}
              disabled={busy}
            />
          </motion.div>
        )}

        <p className="mt-3 text-center text-[10px] text-zinc-400">
          Space flip · ← → move between cards
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200">
            <motion.div
              className="h-full bg-violet-600"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setShowAnswer(false);
              }}
              disabled={index === 0}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {!showAnswer ? (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="min-w-[10rem] rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-violet-700"
              >
                Show answer
              </button>
            ) : (
              <span className="min-w-[10rem] text-center text-xs text-zinc-400">Tap how well you knew it ↑</span>
            )}
            <button
              type="button"
              onClick={() => {
                setIndex((i) => Math.min(total - 1, i + 1));
                setShowAnswer(false);
              }}
              disabled={index >= total - 1}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function RatePill({
  icon,
  label,
  sub,
  color,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition hover:opacity-90 disabled:opacity-50',
        color
      )}
    >
      {icon}
      {label} <span className="font-normal opacity-80">{sub}</span>
    </button>
  );
}
