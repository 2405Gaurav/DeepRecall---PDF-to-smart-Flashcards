'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Library, Sparkles, SortAsc } from 'lucide-react';
import { CueMathLoader } from '@/components/ui/CueMathLoader';
import type { DeckListItem } from '@/lib/types';

type SortOption = 'due' | 'recent' | 'mastery' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  due: 'Due first',
  recent: 'Recently studied',
  mastery: 'Mastery (low→high)',
  newest: 'Newest',
};

function getStoredSort(): SortOption {
  if (typeof window === 'undefined') return 'due';
  return (localStorage.getItem('cue_deck_sort') as SortOption) || 'due';
}

export function DeckList({ refreshKey = 0, compact = false }: { refreshKey?: number; compact?: boolean }) {
  const [decks, setDecks] = useState<DeckListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('due');

  // load sort from localStorage on mount
  useEffect(() => { setSortBy(getStoredSort()); }, []);

  const handleSortChange = (s: SortOption) => {
    setSortBy(s);
    localStorage.setItem('cue_deck_sort', s);
  };

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/decks', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load decks');
      const raw = data.decks as Record<string, unknown>[];
      setDecks(
        raw.map((d) => ({
          id: String(d.id),
          title: String(d.title),
          createdAt: typeof d.createdAt === 'string' ? d.createdAt : new Date(d.createdAt as Date).toISOString(),
          lastReviewedAt:
            d.lastReviewedAt == null ? null
              : typeof d.lastReviewedAt === 'string' ? d.lastReviewedAt
              : new Date(d.lastReviewedAt as Date).toISOString(),
          totalCards: Number(d.totalCards),
          dueCards: Number(d.dueCards),
          newCards: Number(d.newCards ?? 0),
          learningCards: Number(d.learningCards ?? 0),
          familiarCards: Number(d.familiarCards ?? 0),
          masteredCards: Number(d.masteredCards),
          inProgressCards: Number(d.inProgressCards),
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setDecks([]);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const filtered = useMemo(() => {
    if (!decks) return [];
    const q = query.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((d) => d.title.toLowerCase().includes(q));
  }, [decks, query]);

  const sortedDecks = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case 'due':
        copy.sort((a, b) => {
          if (a.dueCards > 0 && b.dueCards === 0) return -1;
          if (b.dueCards > 0 && a.dueCards === 0) return 1;
          return b.dueCards - a.dueCards;
        });
        break;
      case 'recent':
        copy.sort((a, b) => {
          const ta = a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0;
          const tb = b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0;
          return tb - ta;
        });
        break;
      case 'mastery':
        copy.sort((a, b) => {
          const aPct = a.totalCards > 0 ? a.masteredCards / a.totalCards : 0;
          const bPct = b.totalCards > 0 ? b.masteredCards / b.totalCards : 0;
          return aPct - bPct;
        });
        break;
      case 'newest':
        copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return copy;
  }, [filtered, sortBy]);

  if (decks === null) return <CueMathLoader message="Loading your decks…" size="sm" />;

  if (error) return <p className="py-6 text-center text-xs text-red-600" role="alert">{error}</p>;

  if (decks.length === 0) {
    return (
      <motion.div
        className="rounded-2xl border border-dashed border-lab-line/80 bg-lab-mint/25 py-12 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.span className="mb-3 block text-5xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>📚</motion.span>
        <p className="text-base font-semibold text-lab-ink">Your study space is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-lab-soft">Drop a PDF and watch the magic happen. ✨</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-lab-ink">
          <Library className="h-4 w-4 text-lab-teal" />
          Your decks
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative min-w-[140px] max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-lab-soft" />
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-lab-line/80 bg-white py-1.5 pl-8 pr-2 text-xs focus:border-lab-teal focus:outline-none focus:ring-1 focus:ring-lab-teal/40"
            />
          </div>
          <div className="flex items-center gap-1">
            <SortAsc className="h-3.5 w-3.5 text-lab-soft" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-lab-line/80 bg-white px-2 py-1.5 text-xs text-lab-ink focus:border-lab-teal focus:outline-none"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                <option key={s} value={s}>{SORT_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {sortedDecks.map((deck, i) => {
          const masteredPct = deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0;
          const allMastered = deck.totalCards > 0 && deck.masteredCards === deck.totalCards;
          const neverReviewed = !deck.lastReviewedAt;

          // status badge
          let statusBadge: { label: string; className: string };
          if (allMastered) {
            statusBadge = { label: '🏆 Mastered', className: 'border-yellow-300 bg-yellow-50 text-yellow-800' };
          } else if (neverReviewed) {
            statusBadge = { label: '📋 Not started', className: 'border-neutral-200 bg-neutral-50 text-neutral-600' };
          } else if (deck.dueCards > 0) {
            statusBadge = { label: `🔥 ${deck.dueCards} due`, className: 'border-red-200 bg-red-50 text-red-700' };
          } else {
            statusBadge = { label: '✅ All caught up', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
          }

          // segmented progress bar widths
          const newPct = deck.totalCards > 0 ? (deck.newCards / deck.totalCards) * 100 : 0;
          const learnPct = deck.totalCards > 0 ? (deck.learningCards / deck.totalCards) * 100 : 0;
          const famPct = deck.totalCards > 0 ? (deck.familiarCards / deck.totalCards) * 100 : 0;
          const mastPct = deck.totalCards > 0 ? (deck.masteredCards / deck.totalCards) * 100 : 0;

          return (
            <motion.li
              key={deck.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <Link
                  href={`/studio/deck/${deck.id}`}
                  className="block rounded-xl border border-lab-line/80 bg-white/95 p-4 shadow-sm transition hover:border-lab-teal/35 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-lab-ink">{deck.title}</p>
                      <p className="mt-1 text-xs text-lab-soft">
                        Added{' '}
                        {new Date(deck.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' · '}{formatLastPracticed(deck.lastReviewedAt)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* segmented progress bar */}
                  <div className="mt-3">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      {mastPct > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${mastPct}%` }} />}
                      {famPct > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${famPct}%` }} />}
                      {learnPct > 0 && <div className="bg-orange-400 transition-all" style={{ width: `${learnPct}%` }} />}
                      {newPct > 0 && <div className="bg-neutral-300 transition-all" style={{ width: `${newPct}%` }} />}
                    </div>
                    <p className="mt-1.5 text-[11px] text-lab-soft">
                      <span className="text-neutral-500">{deck.newCards} new</span>
                      {' · '}<span className="text-orange-600">{deck.learningCards} learning</span>
                      {' · '}<span className="text-blue-600">{deck.familiarCards} familiar</span>
                      {' · '}<span className="text-emerald-600">{deck.masteredCards} mastered</span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>

      {filtered.length === 0 && query.trim() && (
        <p className="py-4 text-center text-xs text-lab-soft">No match.</p>
      )}
    </div>
  );
}

function formatLastPracticed(iso: string | null): string {
  if (!iso) return 'Not practiced yet';
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.floor((startOf(new Date()) - startOf(d)) / 86400000);
  if (diffDays <= 0) return 'Last practiced today';
  if (diffDays === 1) return 'Last practiced yesterday';
  if (diffDays < 7) return `Last practiced ${diffDays} days ago`;
  return `Last practiced ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}
