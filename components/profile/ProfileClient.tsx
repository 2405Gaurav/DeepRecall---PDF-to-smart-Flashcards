'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Navbar } from '@/components/cuemath/Navbar';
import { Footer } from '@/components/cuemath/Footer';
import { StreakBanner, BadgeWall } from '@/components/ui/BadgeDisplay';
import type { UserAnalyticsPayload } from '@/lib/user-analytics';
import type { UserStreakPayload } from '@/lib/streaks';
import { TrendingUp, BookOpen, ArrowLeft, Flame, Target, Layers, Clock } from 'lucide-react';

type ProfileClientProps = {
  displayName: string;
  childName: string | null;
  grade: string | null;
  username?: string;
};

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// random avatar emojis — pick a stable one based on username
const AVATAR_EMOJIS = ['🧒', '👦', '👧', '🧒🏽', '👦🏻', '👧🏾', '🦊', '🐼', '🐨', '🦁', '🐸', '🐯', '🦄', '🐙', '🐳'];

function pickAvatar(name: string | undefined): string {
  if (!name) return '🧒';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

export function ProfileClient({ displayName, childName, grade, username }: ProfileClientProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsPayload | null>(null);
  const [streakData, setStreakData] = useState<UserStreakPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/me/analytics', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
      setAnalytics(json.analytics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
    fetch('/api/me/streak', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.streak) setStreakData(d.streak); })
      .catch(() => {});
  }, [load]);

  const chartData =
    analytics?.last7Days.map((d) => ({
      day: d.day.slice(5),
      reviews: d.count,
      easy: d.easy,
      hard: d.hard,
    })) ?? [];

  const firstName = displayName?.split(' ')[0] ?? 'Learner';
  const avatar = pickAvatar(username);

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar variant="studio" />

      <main className="mx-auto max-w-4xl px-5 py-8 text-[1.0625rem] leading-relaxed sm:px-8 sm:py-12">

        {/* ── Profile header card ── */}
        <motion.header
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-lab-line/80 bg-white/95 shadow-sm backdrop-blur-sm"
        >
          {/* teal gradient accent strip */}
          <div className="h-24 bg-gradient-to-r from-lab-teal via-lab-teal-dark to-emerald-700" />

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            {/* avatar overlaps the accent strip */}
            <div className="-mt-10 mb-4 flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-lab-mint text-4xl shadow-md">
                {avatar}
              </div>
              <div className="mb-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-lab-teal-dark sm:text-3xl">
                  {firstName}
                </h1>
                {username && (
                  <p className="text-sm font-semibold text-lab-teal">@{username}</p>
                )}
              </div>
            </div>

            {/* user details in compact chips */}
            <div className="flex flex-wrap gap-2 text-sm">
              {childName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lab-mint/60 px-3 py-1 font-medium text-lab-teal-dark">
                  🧒 {childName}
                </span>
              )}
              {grade && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                  📚 Grade {grade}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                👤 {displayName || '—'}
              </span>
            </div>

            <Link
              href="/studio"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-lab-teal hover:text-lab-teal-dark hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to studio
            </Link>
          </div>
        </motion.header>

        {/* ── Streak banner ── */}
        {streakData && (
          <motion.section
            className="mt-8"
            initial="hidden"
            animate="show"
            variants={fade}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <StreakBanner data={streakData} />
          </motion.section>
        )}

        {/* ── Badges ── */}
        {streakData && streakData.badges.length > 0 && (
          <motion.section
            className="mt-8"
            initial="hidden"
            animate="show"
            variants={fade}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">🏅</span>
              <h2 className="font-display text-lg font-bold text-lab-ink">Your Badges</h2>
              <span className="rounded-full bg-lab-teal/10 px-2.5 py-0.5 text-xs font-bold text-lab-teal">
                {streakData.badges.length}
              </span>
            </div>
            <BadgeWall badges={streakData.badges} />
          </motion.section>
        )}

        {streakData && streakData.badges.length === 0 && (
          <motion.section
            className="mt-8"
            initial="hidden"
            animate="show"
            variants={fade}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <BadgeWall badges={[]} />
          </motion.section>
        )}

        {/* ── Analytics section — ALWAYS VISIBLE, no click/hover needed ── */}
        <motion.section
          className="mt-10 rounded-2xl border border-lab-line/70 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold text-lab-teal-dark">
                <TrendingUp className="h-5 w-5" aria-hidden />
                Analytics
              </p>
              <h2 className="mt-2 text-xl font-bold text-lab-ink sm:text-2xl">
                See how much you&apos;ve learned
              </h2>
              <p className="mt-2 max-w-xl text-base text-lab-soft">
                Every tap in practice is saved. Watch your reviews, strong answers, and cards that need another look.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-6 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* loading skeleton while fetching analytics */}
          {!analytics && !error && (
            <div className="mt-8 animate-pulse space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-slate-100/80" />
                ))}
              </div>
              <div className="h-52 w-full rounded-xl bg-slate-100/80" />
              <div className="h-32 w-full rounded-xl bg-slate-100/80" />
            </div>
          )}

          {analytics && (
            <>
              {/* top stat cards — always visible */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  icon={<Target className="h-5 w-5 text-emerald-600" />}
                  label="Mastered"
                  value={analytics.cardsMastered}
                  accent="emerald"
                />
                <StatCard
                  icon={<Layers className="h-5 w-5 text-teal-600" />}
                  label="Reviews"
                  value={analytics.totalReviews}
                  accent="teal"
                />
                <StatCard
                  icon={<Flame className="h-5 w-5 text-orange-500" />}
                  label="Due now"
                  value={analytics.cardsDue}
                  accent="orange"
                />
                <StatCard
                  icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
                  label="Decks"
                  value={analytics.decksOwned}
                  accent="indigo"
                />
              </div>

              {/* secondary stats row */}
              <div className="mt-4 flex flex-wrap gap-3">
                <MiniStat label="On-track taps" value={analytics.easyTotal} color="text-emerald-600" />
                <MiniStat label="Needs practice" value={analytics.hardTotal} color="text-orange-600" />
              </div>

              {/* 7-day chart */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-zinc-800">Last 7 days</p>
                <div className="mt-3 h-52 w-full" style={{ minWidth: 200, minHeight: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#a8cfc7" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e4e4e7',
                          fontSize: 13,
                        }}
                      />
                      <Bar dataKey="easy" stackId="a" fill="#0f766e" name="On track" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hard" stackId="a" fill="#f97316" name="Practice more" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* struggle cards */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">
                  🧗 Struggle cards
                </h3>
                <p className="mt-1 text-xs text-lab-soft">Your hardest cards across all decks — the algorithm will show these more often.</p>
                <ul className="mt-3 space-y-2">
                  {analytics.topCards.filter(c => c.hardCount >= 2).length === 0 ? (
                    <li className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm">
                      <span className="text-xl">💪</span>
                      <span className="text-lab-soft">No struggle cards. You are making this look easy.</span>
                    </li>
                  ) : (
                    analytics.topCards.filter(c => c.hardCount >= 2).slice(0, 5).map((c) => (
                      <li key={c.id} className="rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm leading-snug">
                        <span className="font-medium text-lab-ink line-clamp-2">{c.question}</span>
                        <span className="mt-1 block text-xs text-lab-soft">
                          {c.deckTitle} · <strong className="text-orange-600">{c.hardCount}</strong> times hard
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* strongest cards */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">
                  <BookOpen className="h-5 w-5 text-lab-teal" aria-hidden />
                  Cards you&apos;re strongest on
                </h3>
                <ul className="mt-3 space-y-2">
                  {analytics.topCards.length === 0 ? (
                    <li className="text-sm text-lab-soft">Practice a few decks to see standouts here.</li>
                  ) : (
                    analytics.topCards.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-xl border border-lab-line/50 bg-lab-mint/30 px-4 py-3 text-sm leading-snug"
                      >
                        <span className="font-medium text-lab-ink line-clamp-2">{c.question}</span>
                        <span className="mt-1 block text-xs text-lab-soft">
                          {c.deckTitle} · <strong className="text-lab-teal-dark">{c.easyCount}</strong> easy ·{' '}
                          <strong className="text-orange-600">{c.hardCount}</strong> hard
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* recent activity */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">
                  <Clock className="h-5 w-5 text-lab-soft" aria-hidden />
                  Recent activity
                </h3>
                <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm text-lab-soft">
                  {analytics.recentActivity.length === 0 ? (
                    <li className="text-lab-soft">No reviews yet — open a deck and hit Start practice.</li>
                  ) : (
                    analytics.recentActivity.map((r, i) => (
                      <li key={`${r.at}-${i}`} className="border-b border-lab-line/40 pb-2">
                        <span
                          className={
                            r.outcome === 'EASY' || r.outcome === 'FAMILIAR' || r.outcome === 'MASTERED'
                              ? 'font-semibold text-lab-teal-dark'
                              : 'font-semibold text-orange-600'
                          }
                        >
                          {r.outcome}
                        </span>{' '}
                        · {r.deckTitle}
                        <br />
                        <span className="text-lab-ink">{r.questionSnippet}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

/* ── Stat card with icon ── */
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'emerald' | 'teal' | 'orange' | 'indigo';
}) {
  const bg: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    teal: 'bg-teal-50 border-teal-200',
    orange: 'bg-orange-50 border-orange-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };
  const text: Record<string, string> = {
    emerald: 'text-emerald-700',
    teal: 'text-teal-700',
    orange: 'text-orange-700',
    indigo: 'text-indigo-700',
  };
  return (
    <div className={`rounded-xl border-2 ${bg[accent]} p-4 text-center`}>
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 shadow-sm">
        {icon}
      </div>
      <p className={`text-3xl font-black ${text[accent]}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

/* ── Mini inline stat ── */
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lab-line/60 bg-white px-3 py-1 text-sm">
      <strong className={color}>{value}</strong>
      <span className="text-lab-soft">{label}</span>
    </span>
  );
}
