'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Flame,
  Trash2,
  TrendingUp,
  Trophy,
  Eye,
  EyeOff,
  Play,
} from 'lucide-react';
import type { DeckCardRow, DeckDetailStats } from '@/lib/types';
import { cn } from '@/lib/utils';

function mapRow(c: Record<string, unknown>): DeckCardRow {
  return {
    id: String(c.id),
    question: String(c.question),
    answer: String(c.answer),
    masteryLevel: (c.masteryLevel as DeckCardRow['masteryLevel']) ?? 'NEW',
    cardType: c.cardType != null ? String(c.cardType) : undefined,
  };
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <svg width="72" height="72" viewBox="0 0 80 80" className="-rotate-90 shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" className="stroke-zinc-100" strokeWidth="8" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        className="stroke-violet-600 transition-[stroke-dashoffset] duration-500"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StudioDeckClient({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [stats, setStats] = useState<DeckDetailStats | null>(null);
  const [cards, setCards] = useState<DeckCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deckRes, cardsRes] = await Promise.all([
        fetch(`/api/decks/${deckId}`, { credentials: 'include' }),
        fetch(`/api/decks/${deckId}/cards`, { credentials: 'include' }),
      ]);
      const deckJson = await deckRes.json();
      const cardsJson = await cardsRes.json();
      if (!deckRes.ok) throw new Error(deckJson.error || 'Deck not found');
      if (!cardsRes.ok) throw new Error(cardsJson.error || 'Could not load cards');
      setTitle(deckJson.deck.title);
      setStats(deckJson.stats as DeckDetailStats);
      setCards((cardsJson.cards as Record<string, unknown>[]).map(mapRow));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!confirm('Delete this deck and all cards?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) router.push('/studio');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">Loading deck…</div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/studio" className="mt-4 inline-block text-sm font-semibold text-violet-600">
          ← Studio
        </Link>
      </div>
    );
  }

  const { newCards, learningCards, familiarCards, masteredCards, totalCards, masteredPct } = stats;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <Link href="/studio" className="font-semibold text-violet-600 hover:underline">
          ← Studio
        </Link>
        <span className="text-zinc-300">|</span>
        <Link href="/" className="text-zinc-500 hover:text-zinc-700">
          Home
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h1>
          <p className="mt-1 text-xs text-zinc-500">{totalCards} cards in your deck</p>
        </div>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Learning progress</h2>
            <p className="text-xs text-zinc-500">
              {totalCards} card{totalCards !== 1 ? 's' : ''} in your deck
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing pct={masteredPct} />
            <span className="text-lg font-bold text-violet-600">{masteredPct}%</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatMini
            label="New"
            count={newCards}
            pct={pctOf(newCards, totalCards)}
            className="border-blue-100 bg-blue-50/80 text-blue-800"
            icon={<BookOpen className="h-4 w-4" />}
          />
          <StatMini
            label="Learning"
            count={learningCards}
            pct={pctOf(learningCards, totalCards)}
            className="border-red-100 bg-red-50/80 text-red-800"
            icon={<Flame className="h-4 w-4" />}
          />
          <StatMini
            label="Familiar"
            count={familiarCards}
            pct={pctOf(familiarCards, totalCards)}
            className="border-amber-100 bg-amber-50/80 text-amber-900"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatMini
            label="Mastered"
            count={masteredCards}
            pct={pctOf(masteredCards, totalCards)}
            className="border-emerald-100 bg-emerald-50/80 text-emerald-800"
            icon={<Trophy className="h-4 w-4" />}
          />
        </div>
      </motion.section>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <p className="text-sm font-semibold text-zinc-700">
          {totalCards} flashcard{totalCards !== 1 ? 's' : ''} created
        </p>
        <Link
          href={`/studio/practice/${deckId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-violet-700"
        >
          <Play className="h-4 w-4 fill-current" />
          Start practice
        </Link>
        <button
          type="button"
          onClick={() => setShowAnswers((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 shadow-sm"
        >
          {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showAnswers ? 'Hide' : 'Show'} answers
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-zinc-900">All flashcards</h2>
        <ul className="mt-3 space-y-3">
          {cards.map((c, i) => (
            <li key={c.id} className="grid gap-2 sm:grid-cols-2">
              <div className="relative rotate-[-0.5deg] rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm">
                <span className="text-[10px] font-bold text-violet-600">
                  {i + 1}/{cards.length}
                </span>
                <p className="mt-1 leading-snug text-zinc-800">{c.question}</p>
              </div>
              <div
                className={cn(
                  'relative rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm',
                  !showAnswers && 'select-none'
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Answer</span>
                <p
                  className={cn(
                    'mt-1 leading-snug text-zinc-700 transition',
                    !showAnswers && 'blur-md'
                  )}
                >
                  {c.answer}
                </p>
                {!showAnswers && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/30">
                    <EyeOff className="h-8 w-8 text-zinc-400" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function pctOf(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

function StatMini({
  label,
  count,
  pct,
  className,
  icon,
}: {
  label: string;
  count: number;
  pct: number;
  className: string;
  icon: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
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
