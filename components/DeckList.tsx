'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, Library, Sparkles } from 'lucide-react';
import type { DeckListItem } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

export function DeckList({ refreshKey = 0, compact = false }: { refreshKey?: number; compact?: boolean }) {
  const [decks, setDecks] = useState<DeckListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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
            d.lastReviewedAt == null
              ? null
              : typeof d.lastReviewedAt === 'string'
                ? d.lastReviewedAt
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

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    if (!decks) return [];
    const q = query.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((d) => d.title.toLowerCase().includes(q));
  }, [decks, query]);

  /** Due decks first, then most recently practiced — supports many decks & “pick up where you left off”. */
  const sortedDecks = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aDue = a.dueCards > 0 ? 1 : 0;
      const bDue = b.dueCards > 0 ? 1 : 0;
      if (aDue !== bDue) return bDue - aDue;
      const ta = a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0;
      const tb = b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0;
      if (ta !== tb) return tb - ta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy;
  }, [filtered]);

  if (decks === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-lab-soft">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-6 text-center text-xs text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-lab-line/80 bg-lab-mint/25 py-12 text-center">
        <Sparkles className="mx-auto mb-3 h-10 w-10 text-lab-teal" />
        <p className="text-base font-semibold text-lab-ink">No decks yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-lab-soft">Upload a PDF above to create your first deck.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-lab-ink">
            <Library className="h-4 w-4 text-lab-teal" />
            Your decks
          </h2>
          <div className="relative min-w-[180px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-lab-soft" />
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-lab-line/80 bg-white py-1.5 pl-8 pr-2 text-xs focus:border-lab-teal focus:outline-none focus:ring-1 focus:ring-lab-teal/40"
            />
          </div>
        </div>
      )}

      {compact && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-lab-ink">Your decks</h2>
          <div className="relative max-w-[11rem] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lab-soft" />
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-lab-line/80 py-2 pl-9 pr-2 text-sm focus:border-lab-teal focus:outline-none"
            />
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {sortedDecks.map((deck) => {
          const masteredPct =
            deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0;
          return (
            <li key={deck.id}>
              <Link
                href={`/studio/deck/${deck.id}`}
                className="block rounded-xl border border-lab-line/80 bg-white/95 p-4 shadow-sm transition hover:border-lab-teal/35 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-lab-ink">{deck.title}</p>
                    <p className="mt-1 text-xs text-lab-soft">
                      Added{' '}
                      {new Date(deck.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' · '}
                      {formatLastPracticed(deck.lastReviewedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {deck.dueCards} due
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-lab-soft">
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-800">New {deck.newCards}</span>
                  <span className="rounded-md bg-red-50 px-2 py-1 text-red-800">Learn {deck.learningCards}</span>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-900">Fam. {deck.familiarCards}</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-800">Done {deck.masteredCards}</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-lab-soft/90">
                    <span>Mastered</span>
                    <span>{masteredPct}%</span>
                  </div>
                  <Progress value={masteredPct} className="h-1" />
                </div>
              </Link>
            </li>
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
