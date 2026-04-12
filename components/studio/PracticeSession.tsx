'use client';

import { useCallback, useEffect, useState, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Trophy, PartyPopper, RotateCcw, AlertTriangle } from 'lucide-react';
import type { ReviewFlashcard } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Confetti, useConfetti } from '@/components/ui/Confetti';
import { StreakCounter, Mascot } from '@/components/ui/StreakCounter';
import { MiniParticles } from '@/components/ui/FloatingParticles';
import { NewBadgeCelebration } from '@/components/ui/BadgeDisplay';
import { CueMathLoader } from '@/components/ui/CueMathLoader';

type Outcome = 'LEARNING' | 'FAMILIAR' | 'MASTERED';

// maps raw API data to our ReviewFlashcard type
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
  emoji: string;
  floatEmoji: string;
}[] = [
  {
    outcome: 'LEARNING',
    title: 'Still learning',
    subtitle: "I needed the answer — that's okay!",
    icon: <Flame className="h-5 w-5" />,
    ring: 'ring-red-200 hover:ring-red-300',
    bg: 'bg-red-50/90 border-red-200/90',
    emoji: '🤔',
    floatEmoji: '😕',
  },
  {
    outcome: 'FAMILIAR',
    title: 'Getting there',
    subtitle: 'Almost had it — just a bit shaky',
    icon: <TrendingUp className="h-5 w-5" />,
    ring: 'ring-amber-200 hover:ring-amber-300',
    bg: 'bg-amber-50/90 border-amber-200/90',
    emoji: '😊',
    floatEmoji: '🤔',
  },
  {
    outcome: 'MASTERED',
    title: "I've got it! ⭐",
    subtitle: 'Knew it well — ready to move on',
    icon: <Trophy className="h-5 w-5" />,
    ring: 'ring-emerald-200 hover:ring-emerald-300',
    bg: 'bg-emerald-50/90 border-emerald-200/90',
    emoji: '🎉',
    floatEmoji: '⭐',
  },
];

/** Floating emoji that rises and fades */
function FloatingEmoji({ emoji, onDone }: { emoji: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.span
      className="pointer-events-none fixed left-1/2 text-4xl z-50"
      initial={{ opacity: 1, y: 0, x: '-50%', scale: 0.5 }}
      animate={{ opacity: 0, y: -120, scale: 1.3 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{ bottom: '40%' }}
    >
      {emoji}
    </motion.span>
  );
}

/** Level-up overlay — non-blocking, auto-fades */
function LevelUpOverlay({ level, onDone }: { level: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  const emoji = level === 'MASTERED' ? '🏆' : level === 'FAMILIAR' ? '📈' : '🔥';
  const label = level === 'MASTERED' ? 'Mastered!' : level === 'FAMILIAR' ? 'Familiar!' : 'Learning';

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="rounded-2xl border-2 border-lab-teal/30 bg-white/95 px-8 py-6 text-center shadow-2xl backdrop-blur-sm"
        initial={{ scale: 0.7, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.span
          className="block text-5xl mb-2"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.6 }}
        >
          {emoji}
        </motion.span>
        <p className="font-display text-lg font-bold text-lab-teal-dark">Level up!</p>
        <p className="text-sm text-lab-soft">This card is now <span className="font-bold text-lab-ink">{label}</span></p>
      </motion.div>
    </motion.div>
  );
}

type SessionSummary = {
  updatedMasteryLevel: string;
  previousMasteryLevel: string;
  nextReviewDate: string;
  intervalDays: number;
  isStruggleCard: boolean;
  leveledUp: boolean;
};

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

  // delight state
  const [streak, setStreak] = useState(0);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'think' | 'celebrate'>('idle');
  const [fireConfetti, ConfettiOverlay] = useConfetti(50);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ mastered: 0, familiar: 0, learning: 0 });

  // enhanced stats
  const [levelUps, setLevelUps] = useState<string[]>([]);
  const [struggleCards, setStruggleCards] = useState<string[]>([]);
  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);

  // floating emoji
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  // level-up overlay
  const [levelUpLevel, setLevelUpLevel] = useState<string | null>(null);

  // badge celebration
  const [celebratingBadge, setCelebratingBadge] = useState<{
    emoji: string; title: string; description: string;
  } | null>(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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
    setIsFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setIndex((i) => Math.min(total - 1, i + 1));
    setShowAnswer(false);
    setIsFlipped(false);
  }, [total]);

  const revealAnswer = useCallback(() => {
    setIsFlipped(true);
    setTimeout(() => setShowAnswer(true), 200);
  }, []);

  const sendOutcome = async (outcome: Outcome) => {
    if (!current || busy) return;
    setBusy(true);

    // floating emoji reaction
    const opt = OPTIONS.find(o => o.outcome === outcome);
    if (opt) setFloatingEmoji(opt.floatEmoji);

    // mascot + streak
    if (outcome === 'MASTERED') {
      setStreak((s) => s + 1);
      setMascotMood('celebrate');
      setSessionStats((s) => ({ ...s, mastered: s.mastered + 1 }));
      if (streak >= 2) fireConfetti();
    } else if (outcome === 'FAMILIAR') {
      setStreak((s) => s + 1);
      setMascotMood('happy');
      setSessionStats((s) => ({ ...s, familiar: s.familiar + 1 }));
    } else {
      setStreak(0);
      setMascotMood('think');
      setSessionStats((s) => ({ ...s, learning: s.learning + 1 }));
    }

    try {
      const res = await fetch(`/api/flashcard/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ outcome }),
      });
      if (!res.ok) return;

      const data = await res.json();

      // process session summary
      if (data.sessionSummary) {
        const summary = data.sessionSummary as SessionSummary;

        // track next review date (earliest)
        if (summary.nextReviewDate) {
          setNextSessionDate(prev => {
            if (!prev) return summary.nextReviewDate;
            return summary.nextReviewDate < prev ? summary.nextReviewDate : prev;
          });
        }

        // level-up celebration
        if (summary.leveledUp) {
          setLevelUps(prev => [...prev, summary.updatedMasteryLevel]);
          setTimeout(() => setLevelUpLevel(summary.updatedMasteryLevel), 500);
        }

        // track struggle cards
        if (summary.isStruggleCard) {
          setStruggleCards(prev => [...new Set([...prev, current.question.slice(0, 60)])]);
        }
      }

      // badge celebration
      if (data.streak) {
        setDailyStreak(data.streak.currentStreak ?? 0);
        if (data.streak.newBadges?.length > 0) {
          const badge = data.streak.newBadges[0];
          fireConfetti();
          setTimeout(() => {
            setCelebratingBadge({ emoji: badge.emoji, title: badge.title, description: badge.description });
          }, 500);
        }
      }

      setDirection(1);
      if (index < total - 1) {
        setTimeout(() => {
          setIndex((i) => i + 1);
          setShowAnswer(false);
          setIsFlipped(false);
        }, 400);
      } else {
        setSessionComplete(true);
        fireConfetti();
        setMascotMood('celebrate');
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (mascotMood !== 'idle') {
      const timer = setTimeout(() => setMascotMood('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [mascotMood]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); if (!showAnswer) revealAnswer(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, showAnswer, revealAnswer]);

  if (loading) return <CueMathLoader message="Loading your cards…" fullScreen />;

  if (error || !current) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <motion.span className="mb-4 block text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          {error ? '😕' : '🎉'}
        </motion.span>
        <p className="text-sm text-lab-soft">{error || 'No cards due right now — all caught up! 🎉'}</p>
        <Link href={`/studio/deck/${deckId}`} className="mt-4 inline-block text-sm font-semibold text-lab-teal">
          ← Back to deck
        </Link>
      </div>
    );
  }

  // performance-based motivating message
  const totalReviewed = sessionStats.mastered + sessionStats.familiar + sessionStats.learning;
  const easyPct = totalReviewed > 0 ? Math.round(((sessionStats.mastered + sessionStats.familiar) / totalReviewed) * 100) : 0;
  const motivMessage =
    easyPct >= 80 ? 'You are crushing it! Keep the streak alive. 🔥'
    : easyPct >= 50 ? 'Solid session. The tricky ones will click soon. 💪'
    : 'Tough session — but that is how learning works. Come back tomorrow. 🧠';

  // session complete screen
  if (sessionComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-lab-grid font-cue px-4">
        <ConfettiOverlay />
        <motion.div
          className="mx-auto max-w-md text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.span
            className="mb-6 block text-7xl"
            animate={{ rotate: [0, -10, 10, -5, 5, 0], y: [0, -15, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
          >
            🎉
          </motion.span>
          <h1 className="font-display text-3xl font-bold text-lab-teal-dark sm:text-4xl">
            Amazing work!
          </h1>
          <p className="mt-3 text-lg text-lab-soft">
            You reviewed <span className="font-bold text-lab-ink">{total}</span> cards in this session!
          </p>
          <p className="mt-2 text-sm font-medium text-lab-teal">{motivMessage}</p>

          {/* stats grid */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <motion.div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <span className="block text-2xl">🏆</span>
              <span className="mt-1 block text-2xl font-black text-emerald-700">{sessionStats.mastered}</span>
              <span className="text-xs font-semibold text-emerald-600">Mastered</span>
            </motion.div>
            <motion.div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <span className="block text-2xl">📈</span>
              <span className="mt-1 block text-2xl font-black text-amber-700">{sessionStats.familiar}</span>
              <span className="text-xs font-semibold text-amber-600">Getting there</span>
            </motion.div>
            <motion.div className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <span className="block text-2xl">🔥</span>
              <span className="mt-1 block text-2xl font-black text-red-600">{sessionStats.learning}</span>
              <span className="text-xs font-semibold text-red-500">Still learning</span>
            </motion.div>
          </div>

          {/* level-ups */}
          {levelUps.length > 0 && (
            <motion.div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <p className="font-bold text-violet-700">🎯 {levelUps.length} card{levelUps.length > 1 ? 's' : ''} leveled up!</p>
            </motion.div>
          )}

          {/* struggle cards */}
          {struggleCards.length > 0 && (
            <motion.div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <p className="font-bold text-orange-700 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {struggleCards.length} struggle card{struggleCards.length > 1 ? 's' : ''}</p>
              <p className="mt-1 text-xs text-orange-600">You&apos;ll see these again soon — that&apos;s how the algorithm helps you.</p>
            </motion.div>
          )}

          {/* next session */}
          {nextSessionDate && (
            <motion.p className="mt-4 text-xs text-lab-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              Next session recommended: <span className="font-semibold text-lab-ink">
                {new Date(nextSessionDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </motion.p>
          )}

          {dailyStreak > 0 && (
            <motion.div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <motion.span className="text-xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}>🔥</motion.span>
              <span className="text-sm font-bold text-orange-700">{dailyStreak}-day daily streak!</span>
            </motion.div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {struggleCards.length > 0 && (
              <motion.button
                type="button"
                onClick={() => {
                  setSessionComplete(false);
                  setIndex(0);
                  setShowAnswer(false);
                  setIsFlipped(false);
                  setStreak(0);
                  setSessionStats({ mastered: 0, familiar: 0, learning: 0 });
                  setLevelUps([]);
                  setStruggleCards([]);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-orange-400 bg-orange-50 px-6 py-3 text-sm font-bold text-orange-700 shadow-sm transition hover:bg-orange-100"
              >
                <RotateCcw className="h-4 w-4" /> Review Struggle Cards
              </motion.button>
            )}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={`/studio/deck/${deckId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-lab-teal px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-lab-teal-dark"
              >
                Back to Studio →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-lab-grid font-cue">
      <ConfettiOverlay />
      <NewBadgeCelebration badge={celebratingBadge} onDismiss={() => setCelebratingBadge(null)} />

      {/* floating emoji reaction */}
      <AnimatePresence>
        {floatingEmoji && (
          <FloatingEmoji key={floatingEmoji + Date.now()} emoji={floatingEmoji} onDone={() => setFloatingEmoji(null)} />
        )}
      </AnimatePresence>

      {/* level-up overlay */}
      <AnimatePresence>
        {levelUpLevel && (
          <LevelUpOverlay key={levelUpLevel} level={levelUpLevel} onDone={() => setLevelUpLevel(null)} />
        )}
      </AnimatePresence>

      {/* header */}
      <motion.header
        className="border-b border-lab-line/70 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm"
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link href={`/studio/deck/${deckId}`} className="text-xs font-semibold text-lab-soft transition-colors hover:text-lab-teal">
            ✕ Exit practice
          </Link>
          <div className="flex items-center gap-3">
            <StreakCounter streak={streak} />
            <p className="truncate text-center text-xs font-medium text-lab-soft">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mascot mood={mascotMood} className="text-2xl" />
            <span className="text-xs font-bold text-lab-ink">{index + 1}/{total}</span>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
        {/* 3D card with whoosh effect */}
        <div className="relative mx-auto min-h-[220px] w-full max-w-md perspective-600">
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
              className="relative w-full"
            >
              <MiniParticles />

              {/* stacked card effect */}
              <div className="pointer-events-none absolute -right-1 -z-10 h-full w-full translate-x-1 translate-y-2 rounded-2xl border border-lab-line/40 bg-white/90 shadow-sm" />
              <div className="pointer-events-none absolute -right-2 -z-20 h-full w-full translate-x-2 translate-y-4 rounded-2xl border border-lab-line/20 bg-white/70 shadow-sm" />

              {/* main card with 3D flip + whoosh scale */}
              <motion.div
                className={cn(
                  'relative w-full rounded-2xl border-2 bg-white p-6 shadow-lg transition-all duration-500 sm:p-7',
                  isFlipped ? 'border-sky-300/90' : 'border-lab-teal/35',
                )}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={showAnswer ? `ans-${current.id}` : `q-${current.id}`}
                    initial={{ opacity: 0, rotateY: showAnswer ? -90 : 0, scale: 0.95 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: showAnswer ? 0 : 90, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-center text-base font-medium leading-relaxed text-lab-ink sm:text-lg">
                      {showAnswer ? current.answer : current.question}
                    </p>
                    <motion.p
                      className={cn(
                        'mt-4 text-center text-[10px] font-bold uppercase tracking-widest',
                        showAnswer ? 'text-sky-600' : 'text-lab-teal'
                      )}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {showAnswer ? '✦ Answer' : '? Question'}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* outcome buttons with bounce on click */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 w-full max-w-md mx-auto space-y-3"
          >
            <div className="text-center">
              <p className="text-sm font-bold text-lab-ink sm:text-base">How well did you know this?</p>
              <p className="mt-1 text-xs text-lab-soft sm:text-sm">
                Your answer shapes what comes back — and when! 🧠
              </p>
            </div>
            <div className="grid gap-2.5" role="group" aria-label="How well you knew the answer">
              {OPTIONS.map((opt) => (
                <motion.button
                  key={opt.outcome}
                  type="button"
                  disabled={busy}
                  onClick={() => void sendOutcome(opt.outcome)}
                  whileHover={{ scale: busy ? 1 : 1.02, y: busy ? 0 : -2 }}
                  whileTap={{ scale: busy ? 1 : 1.15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left shadow-sm ring-2 ring-transparent transition-all disabled:opacity-50 sm:py-4',
                    opt.bg,
                    opt.ring
                  )}
                >
                  <motion.span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/80 text-lab-ink shadow-sm"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {opt.icon}
                  </motion.span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-lab-ink sm:text-base">{opt.title}</span>
                    <span className="mt-0.5 block text-xs text-lab-soft sm:text-sm">{opt.subtitle}</span>
                  </span>
                  <span className="text-lg">{opt.emoji}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <p className="mt-4 text-center text-[11px] text-lab-soft/80">
          Space: show answer · ← →: previous / next card
        </p>

        {/* navigation and progress */}
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="h-2 w-full overflow-hidden rounded-full bg-lab-line/40">
            <motion.div
              className={cn(
                'h-full rounded-full',
                progressPct >= 100
                  ? 'animate-rainbow-shimmer'
                  : 'bg-gradient-to-r from-lab-teal via-sky-500 to-violet-500'
              )}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <motion.button type="button" onClick={goPrev} disabled={index === 0} whileHover={{ scale: index === 0 ? 1 : 1.08 }} whileTap={{ scale: index === 0 ? 1 : 0.92 }} className="flex h-11 w-11 items-center justify-center rounded-xl border border-lab-line/80 bg-white text-lab-soft shadow-sm transition hover:border-lab-teal/40 disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            {!showAnswer ? (
              <motion.button type="button" onClick={revealAnswer} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="min-w-[11rem] rounded-xl bg-lab-teal px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-lab-teal-dark animate-pulse-glow">
                ✨ Show answer
              </motion.button>
            ) : (
              <span className="min-w-[11rem] text-center text-xs text-lab-soft sm:text-sm">
                Choose how well you knew it ↑
              </span>
            )}
            <motion.button type="button" onClick={goNext} disabled={index >= total - 1} whileHover={{ scale: index >= total - 1 ? 1 : 1.08 }} whileTap={{ scale: index >= total - 1 ? 1 : 0.92 }} className="flex h-11 w-11 items-center justify-center rounded-xl border border-lab-line/80 bg-white text-lab-soft shadow-sm transition hover:border-lab-teal/40 disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
