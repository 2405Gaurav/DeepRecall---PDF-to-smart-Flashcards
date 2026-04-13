'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Flame, Trash2, TrendingUp, Trophy } from 'lucide-react';
import type { DeckCardRow, DeckDetailStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/studio/ui/ProgressRing';
import { DeckStatCard } from '@/components/studio/ui/DeckStatCard';
import { FlashcardItem, ShowAnswersToggle } from '@/components/studio/ui/FlashcardItem';
import { DeckActionsBar } from '@/components/studio/ui/DeckActionsBar';
import { SkeletonFlashcard } from '@/components/studio/ui/SkeletonFlashcard';
import { CueMathLoader } from '@/components/ui/CueMathLoader';

const PAGE_SIZE = 5;
const POLL_INTERVAL_MS = 2500;
/** Safety cap — stop polling after this many ticks (~3.3 min) */
const MAX_POLL_TICKS = 80;

/** Map for how many skeleton placeholders to show per preset */
const PRESET_SKELETON_COUNT: Record<string, number> = {
  few: 8,
  normal: 16,
  many: 32,
};

function mapRow(c: Record<string, unknown>): DeckCardRow {
  return {
    id: String(c.id),
    question: String(c.question),
    answer: String(c.answer),
    masteryLevel: (c.masteryLevel as DeckCardRow['masteryLevel']) ?? 'NEW',
    cardType: c.cardType != null ? String(c.cardType) : undefined,
    nextReview: c.nextReview
      ? (typeof c.nextReview === 'string' ? c.nextReview : new Date(c.nextReview as Date).toISOString())
      : undefined,
    easyCount: typeof c.easyCount === 'number' ? c.easyCount : 0,
    hardCount: typeof c.hardCount === 'number' ? c.hardCount : 0,
  };
}

export function StudioDeckClient({ deckId }: { deckId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [deckStatus, setDeckStatus] = useState<'GENERATING' | 'READY' | 'FAILED' | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [stats, setStats] = useState<DeckDetailStats | null>(null);
  const [cards, setCards] = useState<DeckCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTickRef = useRef(0);

  // grab expected skeleton count from query param (?preset=few|normal|many)
  const presetParam = searchParams.get('preset') ?? 'normal';
  const expectedCount = PRESET_SKELETON_COUNT[presetParam] ?? 16;

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  /** Poll /api/decks/:id/status every POLL_INTERVAL_MS until READY or FAILED */
  const startPolling = useCallback(() => {
    stopPolling();
    pollTickRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollTickRef.current += 1;
      // safety cap — don't poll forever
      if (pollTickRef.current > MAX_POLL_TICKS) {
        stopPolling();
        setGenerationError('Generation timed out. The AI took too long — try uploading again.');
        setDeckStatus('FAILED');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/decks/${deckId}/status`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json() as { status: string; flashcardCount: number; error?: string };
        setDeckStatus(data.status as 'GENERATING' | 'READY' | 'FAILED');
        if (data.status === 'READY') {
          stopPolling();
          await load(); // refresh full deck data — cards are ready now
        } else if (data.status === 'FAILED') {
          stopPolling();
          setGenerationError(data.error ?? 'Card generation failed. Please try uploading again.');
          setLoading(false);
        }
      } catch { /* network glitch — keep polling */ }
    }, POLL_INTERVAL_MS);
  }, [deckId]); // eslint-disable-line react-hooks/exhaustive-deps

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

      setTitle(deckJson.deck.title);
      setDeckStatus(deckJson.deck.status ?? 'READY');

      // if still generating, show skeleton UI and start polling
      if (deckJson.deck.status === 'GENERATING') {
        setLoading(false);
        startPolling();
        return;
      }
      if (deckJson.deck.status === 'FAILED') {
        setGenerationError(deckJson.deck.generationError ?? 'Generation failed.');
        setLoading(false);
        return;
      }

      if (!cardsRes.ok) throw new Error(cardsJson.error || 'Could not load cards');
      setStats(deckJson.stats as DeckDetailStats);
      setCards((cardsJson.cards as Record<string, unknown>[]).map(mapRow));
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [deckId, startPolling]);

  useEffect(() => { void load(); return () => stopPolling(); }, [load]);
  useEffect(() => {
    setVisibleCount((v) => (cards.length === 0 ? v : Math.min(v, cards.length)));
  }, [cards.length]);

  const handleDelete = async () => {
    if (!confirm('Delete this deck and all cards?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) router.push('/studio');
    } finally { setDeleting(false); }
  };

  const handleResetCard = async (cardId: string) => {
    if (!confirm('Reset this card to NEW? It will appear as unreviewed.')) return;
    try {
      await fetch(`/api/flashcard/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ outcome: 'LEARNING' }),
      });
      await load();
    } catch (e) { console.warn('Reset failed:', e); }
  };

  // ── Initial loading spinner (first fetch only) ───────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <CueMathLoader message="Loading deck…" />
      </div>
    );
  }

  // ── FAILED: show error with retry ───────────────────────────────────────
  if (deckStatus === 'FAILED' || generationError) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-3xl">😔</p>
        <h1 className="mt-3 font-display text-lg font-bold text-lab-ink">Card generation failed</h1>
        <p className="mt-2 text-sm text-lab-soft">{generationError ?? 'Something went wrong generating your cards.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void handleDelete()} disabled={deleting} className="border-red-200 text-red-600">
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete deck
          </Button>
          <Button asChild size="sm" className="bg-lab-teal text-white">
            <Link href="/studio">← Try another PDF</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Button asChild variant="link" className="mt-4 text-lab-teal">
          <Link href="/studio">← Back to studio</Link>
        </Button>
      </div>
    );
  }

  // ── GENERATING: show full deck layout with skeleton cards ────────────────
  const isGenerating = deckStatus === 'GENERATING';

  if (isGenerating) {
    const skeletonCount = expectedCount;

    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* breadcrumbs */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-lab-teal hover:text-lab-teal-dark">
            <Link href="/studio">← Studio</Link>
          </Button>
          <span className="text-lab-line">|</span>
          <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-lab-soft hover:text-lab-ink">
            <Link href="/">Home</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-lab-teal-dark sm:text-2xl">{title || 'Building your deck…'}</h1>
            <p className="mt-1 text-xs text-lab-soft">
              <motion.span
                className="inline-flex items-center gap-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ AI is generating your flashcards…
              </motion.span>
            </p>
          </div>
        </div>

        {/* generating progress banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="mt-5 border-lab-teal/20 bg-gradient-to-r from-lab-mint/40 via-white to-lab-lilac/30 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-lab-teal/10 text-xl"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🧠
              </motion.div>
              <div>
                <p className="text-sm font-bold text-lab-ink">Gemini is reading your PDF</p>
                <p className="text-xs text-lab-soft">
                  Building ~{skeletonCount} teacher-quality flashcards. This usually takes 10–30 seconds.
                </p>
              </div>
              <div className="ml-auto flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-lab-teal"
                    animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* skeleton flashcard list */}
        <section className="mt-8">
          <h2 className="text-sm font-bold text-lab-ink">Flashcards</h2>
          <p className="mt-1 text-xs text-lab-soft">Preparing {skeletonCount} cards…</p>
          <ul className="mt-3 space-y-3">
            {Array.from({ length: Math.min(skeletonCount, PAGE_SIZE) }).map((_, i) => (
              <SkeletonFlashcard key={`skel-${i}`} index={i} delay={i} />
            ))}
          </ul>

          {/* disabled actions bar */}
          <DeckActionsBar
            deckId={deckId}
            totalCards={skeletonCount}
            canShowMore={false}
            onShowMore={() => {}}
            showAnswersToggle={<ShowAnswersToggle showAnswers={false} onToggle={() => {}} />}
            generating
          />
        </section>
      </div>
    );
  }

  // ── READY: Normal deck view ─────────────────────────────────────────────
  if (!stats) return null;

  const { newCards, learningCards, familiarCards, masteredCards, totalCards, masteredPct } = stats;
  const visibleCards = cards.slice(0, visibleCount);
  const canShowMore = visibleCount < cards.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-lab-teal hover:text-lab-teal-dark">
          <Link href="/studio">← Studio</Link>
        </Button>
        <span className="text-lab-line">|</span>
        <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-lab-soft hover:text-lab-ink">
          <Link href="/">Home</Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-lab-teal-dark sm:text-2xl">{title}</h1>
          <p className="mt-1 text-xs text-lab-soft">{totalCards} cards in your deck</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void handleDelete()}
          disabled={deleting} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="mt-5 border-lab-line/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-lab-ink">Learning progress</h2>
              <p className="text-xs text-lab-soft">{totalCards} card{totalCards !== 1 ? 's' : ''} in your deck</p>
            </div>
            <div className="flex items-center gap-2">
              <ProgressRing pct={masteredPct} />
              <span className="text-lg font-bold text-lab-teal-dark">{masteredPct}%</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DeckStatCard label="New" count={newCards} pct={pctOf(newCards, totalCards)} className="border-sky-200/90 bg-sky-50/90 text-sky-900" icon={<BookOpen className="h-4 w-4 text-sky-600" />} />
            <DeckStatCard label="Learning" count={learningCards} pct={pctOf(learningCards, totalCards)} className="border-orange-200/90 bg-lab-sand/90 text-orange-950" icon={<Flame className="h-4 w-4 text-orange-600" />} />
            <DeckStatCard label="Familiar" count={familiarCards} pct={pctOf(familiarCards, totalCards)} className="border-amber-200/90 bg-amber-50/90 text-amber-950" icon={<TrendingUp className="h-4 w-4 text-amber-600" />} />
            <DeckStatCard label="Mastered" count={masteredCards} pct={pctOf(masteredCards, totalCards)} className="border-emerald-200/90 bg-lab-mint/90 text-emerald-900" icon={<Trophy className="h-4 w-4 text-emerald-700" />} />
          </div>
        </Card>
      </motion.div>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-lab-ink">All flashcards</h2>
        <p className="mt-1 text-xs text-lab-soft">Showing {visibleCards.length} of {cards.length}</p>
        <ul className="mt-3 space-y-3">
          {visibleCards.map((c, i) => (
            <FlashcardItem key={c.id} card={c} index={i} total={cards.length}
              showAnswers={showAnswers} onReset={(id) => void handleResetCard(id)} />
          ))}
        </ul>
        <DeckActionsBar deckId={deckId} totalCards={totalCards} canShowMore={canShowMore}
          showMoreCount={Math.min(cards.length - visibleCount, PAGE_SIZE)}
          onShowMore={() => setVisibleCount((n) => Math.min(n + PAGE_SIZE, cards.length))}
          showAnswersToggle={<ShowAnswersToggle showAnswers={showAnswers} onToggle={() => setShowAnswers((s) => !s)} />}
        />
      </section>
    </div>
  );
}

function pctOf(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
