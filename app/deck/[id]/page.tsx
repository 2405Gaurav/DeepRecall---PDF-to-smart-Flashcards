'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlashcardReview } from '@/components/FlashcardReview';
import type { ReviewFlashcard, DeckDetailStats } from '@/lib/types';
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type DeckMeta = {
  id: string;
  title: string;
  createdAt: string;
};

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<DeckMeta | null>(null);
  const [stats, setStats] = useState<DeckDetailStats | null>(null);
  const [dueCards, setDueCards] = useState<ReviewFlashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [deckRes, reviewRes] = await Promise.all([
          fetch(`/api/decks/${id}`, { credentials: 'include' }),
          fetch(`/api/decks/${id}/review`, { credentials: 'include' }),
        ]);
        const deckJson = await deckRes.json();
        const reviewJson = await reviewRes.json();
        if (!deckRes.ok) throw new Error(deckJson.error || 'Failed to load deck');
        if (!reviewRes.ok) throw new Error(reviewJson.error || 'Failed to load review queue');
        if (!cancelled) {
          setDeck({
            id: deckJson.deck.id,
            title: deckJson.deck.title,
            createdAt:
              typeof deckJson.deck.createdAt === 'string'
                ? deckJson.deck.createdAt
                : new Date(deckJson.deck.createdAt).toISOString(),
          });
          setStats(deckJson.stats);
          const raw = reviewJson.cards as Record<string, unknown>[];
          setDueCards(
            raw.map((c) => ({
              id: String(c.id),
              question: String(c.question),
              answer: String(c.answer),
              difficulty: c.difficulty as ReviewFlashcard['difficulty'],
              interval: Number(c.interval),
              nextReview:
                typeof c.nextReview === 'string'
                  ? c.nextReview
                  : new Date(c.nextReview as Date).toISOString(),
              lastReviewed: c.lastReviewed
                ? typeof c.lastReviewed === 'string'
                  ? c.lastReviewed
                  : new Date(c.lastReviewed as Date).toISOString()
                : null,
              deckId: String(c.deckId),
              createdAt:
                typeof c.createdAt === 'string'
                  ? c.createdAt
                  : new Date(c.createdAt as Date).toISOString(),
              cardType: c.cardType != null ? String(c.cardType) : undefined,
            }))
          );
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refreshQueue = async () => {
    try {
      const reviewRes = await fetch(`/api/decks/${id}/review`);
      const reviewJson = await reviewRes.json();
      if (!reviewRes.ok) return;
      const raw = reviewJson.cards as Record<string, unknown>[];
      setDueCards(
        raw.map((c) => ({
          id: String(c.id),
          question: String(c.question),
          answer: String(c.answer),
          difficulty: c.difficulty as ReviewFlashcard['difficulty'],
          interval: Number(c.interval),
          nextReview:
            typeof c.nextReview === 'string'
              ? c.nextReview
              : new Date(c.nextReview as Date).toISOString(),
          lastReviewed: c.lastReviewed
            ? typeof c.lastReviewed === 'string'
              ? c.lastReviewed
              : new Date(c.lastReviewed as Date).toISOString()
            : null,
          deckId: String(c.deckId),
          createdAt:
            typeof c.createdAt === 'string'
              ? c.createdAt
              : new Date(c.createdAt as Date).toISOString(),
          cardType: c.cardType != null ? String(c.cardType) : undefined,
        }))
      );
      const deckRes = await fetch(`/api/decks/${id}`, { credentials: 'include' });
      const deckJson = await deckRes.json();
      if (deckRes.ok) setStats(deckJson.stats);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this deck and all its cards? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/decks/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) router.push('/');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading deck…
      </div>
    );
  }

  if (error || !deck || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error || 'Deck not found'}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/studio" className="text-lab-teal font-semibold hover:underline">
            Your studio
          </Link>
          <Link href="/" className="text-lab-soft hover:underline">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const masteredPct = stats.totalCards > 0 ? Math.round((stats.masteredCards / stats.totalCards) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/studio" className="font-semibold text-lab-teal hover:underline">
            ← Studio
          </Link>
          <Link href="/" className="text-lab-soft hover:underline">
            Home
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{deck.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {stats.totalCards} cards &middot;{' '}
              {new Date(deck.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center text-sm mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Due today</p>
              <p className="text-xl font-bold text-amber-700 mt-0.5">{stats.dueCards}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Mastered</p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{stats.masteredCards}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">In progress</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.inProgressCards}</p>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Mastery</span>
            <span>{masteredPct}%</span>
          </div>
          <Progress value={masteredPct} className="h-2" />
        </div>
      </div>

      <FlashcardReview flashcards={dueCards} />

      {dueCards.length > 0 && (
        <p className="text-center mt-8">
          <button
            type="button"
            onClick={() => void refreshQueue()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh queue
          </button>
        </p>
      )}
    </main>
  );
}
