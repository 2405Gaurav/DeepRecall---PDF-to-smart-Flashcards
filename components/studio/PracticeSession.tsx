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

const cardSpring = { type: 'spring' as const, stiffness: 340, damping: 30, mass: 0.85 };

const cardSlide = {
  enter: (dir: number) => {
    if (dir === 0) return { opacity: 0, y: 20, scale: 0.97 };
    return { x: dir * 80, opacity: 0, rotate: dir * 2.5 };
  },
  center: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
  exit: (dir: number) => {
    if (dir === 0) return { opacity: 0, y: -14, scale: 0.99 };
    return { x: -dir * 80, opacity: 0, rotate: -dir * 2.5 };
  },
};

const OPTIONS: {
  outcome: Outcome;
  title: string;
  subtitle: string;
  icon: ReactNode;
  ring: string;
  bg: string;
}[] = [
  {
    outcome: 'LEARNING',
    title: 'Still learning',
    subtitle: 'I needed the answer — not sure yet',
    icon: <Flame className="h-5 w-5" />,
    ring: 'ring-red-200 hover:ring-red-300',
    bg: 'bg-red-50/90 border-red-200/90',
  },
  {
    outcome: 'FAMILIAR',
    title: 'Getting there',
    subtitle: 'Almost had it — a bit shaky',
    icon: <TrendingUp className="h-5 w-5" />,
    ring: 'ring-amber-200 hover:ring-amber-300',
    bg: 'bg-amber-50/90 border-amber-200/90',
  },
  {
    outcome: 'MASTERED',
    title: "I've got it",
    subtitle: 'Knew it well — ready to move on',
    icon: <Trophy className="h-5 w-5" />,
    ring: 'ring-emerald-200 hover:ring-emerald-300',
    bg: 'bg-emerald-50/90 border-emerald-200/90',
  },
];

export function PracticeSession({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState<ReviewFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [direction, setDirection] = useState(0);

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

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
    setShowAnswer(false);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setIndex((i) => Math.min(total - 1, i + 1));
    setShowAnswer(false);
  }, [total]);

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
      setDirection(1);
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
        goPrev();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

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
      <motion.header
        className="border-b border-zinc-200 bg-white px-4 py-3 shadow-sm"
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href={`/studio/deck/${deckId}`}
            className="text-xs font-semibold text-zinc-500 transition-colors hover:text-violet-600"
          >
            ✕ Exit practice
          </Link>
          <p className="truncate text-center text-xs font-medium text-zinc-600">{title}</p>
          <span className="text-xs font-bold text-zinc-800">
            {index + 1}/{total}
          </span>
        </div>
      </motion.header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
        <div className="relative mx-auto min-h-[200px] w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={current.id}
              role="group"
              aria-label={`Card ${index + 1} of ${total}`}
              custom={direction}
              variants={cardSlide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardSpring}
              className={cn(
                'relative w-full rounded-2xl border-2 bg-white p-6 shadow-lg sm:p-7',
                showAnswer ? 'border-violet-300' : 'border-lab-teal/25'
              )}
            >
              <div className="pointer-events-none absolute -right-1 -z-10 h-full w-full translate-x-1 translate-y-2 rounded-2xl border border-zinc-100 bg-white shadow-sm" />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={showAnswer ? `ans-${current.id}` : `q-${current.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-center text-base font-medium leading-relaxed text-zinc-900 sm:text-lg">
                    {showAnswer ? current.answer : current.question}
                  </p>
                  <p
                    className={cn(
                      'mt-4 text-center text-[10px] font-bold uppercase tracking-widest',
                      showAnswer ? 'text-violet-600' : 'text-lab-teal'
                    )}
                  >
                    {showAnswer ? 'Answer' : 'Question'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 w-full max-w-md mx-auto space-y-3"
          >
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900 sm:text-base">How well did you know this?</p>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                Your choice updates your progress — still learning, getting there, or ready to move on.
              </p>
            </div>
            <div className="grid gap-2.5" role="group" aria-label="Difficulty — how well you knew the answer">
              {OPTIONS.map((opt) => (
                <motion.button
                  key={opt.outcome}
                  type="button"
                  disabled={busy}
                  onClick={() => void sendOutcome(opt.outcome)}
                  whileHover={{ scale: busy ? 1 : 1.01 }}
                  whileTap={{ scale: busy ? 1 : 0.99 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left shadow-sm ring-2 ring-transparent transition-colors disabled:opacity-50 sm:py-4',
                    opt.bg,
                    opt.ring
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/80 text-zinc-800 shadow-sm">
                    {opt.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-zinc-900 sm:text-base">{opt.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-600 sm:text-sm">{opt.subtitle}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <p className="mt-4 text-center text-[11px] text-zinc-400">
          Space: show answer · ← →: previous / next card
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <motion.div
              className="h-full bg-gradient-to-r from-lab-teal to-violet-600"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              whileHover={{ scale: index === 0 ? 1 : 1.05 }}
              whileTap={{ scale: index === 0 ? 1 : 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            {!showAnswer ? (
              <motion.button
                type="button"
                onClick={() => setShowAnswer(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="min-w-[11rem] rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-violet-700"
              >
                Show answer
              </motion.button>
            ) : (
              <span className="min-w-[11rem] text-center text-xs text-zinc-500 sm:text-sm">
                Choose how well you knew it above
              </span>
            )}
            <motion.button
              type="button"
              onClick={goNext}
              disabled={index >= total - 1}
              whileHover={{ scale: index >= total - 1 ? 1 : 1.05 }}
              whileTap={{ scale: index >= total - 1 ? 1 : 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
