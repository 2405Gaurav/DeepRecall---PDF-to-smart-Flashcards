'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, Library, Sparkles } from 'lucide-react';
import type { DeckListItem } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

export function DeckList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [decks, setDecks] = useState<DeckListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/decks', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load decks');
      setDecks(data.decks);
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

  if (decks === null) {
    return (
      <div className="flex items-center justify-center gap-2 text-slate-500 py-12">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading decks…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-sm text-red-600 py-8" role="alert">
        {error}
      </p>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-200 bg-white/80">
        <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="font-semibold text-slate-800">No decks yet</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Upload a PDF above to create your first deck. Cards will appear here for review anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Library className="w-5 h-5 text-slate-600" />
          Your decks
        </h2>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>

      <ul className="space-y-3">
        {filtered.map((deck) => {
          const masteredPct =
            deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0;
          return (
            <li key={deck.id}>
              <Link
                href={`/deck/${deck.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{deck.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(deck.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                    {deck.dueCards} due
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-slate-400 uppercase tracking-wide">Due today</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{deck.dueCards}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase tracking-wide">Mastered</p>
                    <p className="font-semibold text-emerald-700 mt-0.5">{deck.masteredCards}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase tracking-wide">In progress</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{deck.inProgressCards}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Mastery</span>
                    <span>{masteredPct}%</span>
                  </div>
                  <Progress value={masteredPct} className="h-1.5" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && query.trim() && (
        <p className="text-center text-sm text-slate-500 py-6">No decks match “{query.trim()}”.</p>
      )}
    </div>
  );
}
