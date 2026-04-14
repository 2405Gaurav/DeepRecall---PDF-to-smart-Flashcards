'use client';

import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Flame, Layers, Target, TrendingUp } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ui/ProfileHeader';
import { StreakSection } from '@/components/profile/ui/StreakSection';
import { AnalyticsStatCard, MiniStat } from '@/components/profile/ui/AnalyticsStatCard';
import type { UserAnalyticsPayload } from '@/lib/user-analytics';
import type { UserStreakPayload } from '@/lib/streaks';

// Lazy-load recharts — large bundle, only needed when analytics section is visible.
// Use explicit pixel height (208 = h-52) — height="100%" returns -1 inside Suspense
// because the Suspense boundary breaks CSS height inheritance before first paint.
const LazyBarChart = lazy(() =>
  import('recharts').then(({ ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid }) => ({
    default: function RechartsBar({ data }: { data: Record<string, unknown>[] }) {
      return (
        <ResponsiveContainer width="100%" height={208}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a8cfc7" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 13 }} />
            <Bar dataKey="easy" stackId="a" fill="#0f766e" name="On track" radius={[4, 4, 0, 0] as [number, number, number, number]} />
            <Bar dataKey="hard" stackId="a" fill="#f97316" name="Practice more" radius={[4, 4, 0, 0] as [number, number, number, number]} />
          </BarChart>
        </ResponsiveContainer>
      );
    },
  }))
);


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

const AVATAR_EMOJIS = ['🦁', '🐯', '🦊', '🐼', '🐨', '🦄', '🐙', '🐳', '🦋', '🦚', '🦜', '🐬', '🐸', '🦝', '🐺'];

const HEADER_GRADIENTS = [
  'from-violet-500 via-purple-600 to-indigo-700',
  'from-rose-400 via-pink-500 to-fuchsia-600',
  'from-amber-400 via-orange-500 to-red-500',
  'from-cyan-400 via-teal-500 to-blue-600',
  'from-emerald-400 via-green-500 to-teal-600',
  'from-indigo-500 via-blue-600 to-cyan-500',
  'from-fuchsia-500 via-pink-500 to-rose-500',
];

const MOTIVATIONAL_QUOTES = [
  'One full session today is enough to start the streak.',
  'Small daily wins turn into big learning gains.',
  "Finish today's cards and let the streak begin.",
  'Consistency grows faster than motivation.',
];

function pickAvatar(name: string | undefined): string {
  if (!name) return '🦁';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

function pickGradient(name: string | undefined): string {
  if (!name) return HEADER_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return HEADER_GRADIENTS[Math.abs(hash) % HEADER_GRADIENTS.length];
}

export function ProfileClientBento({ displayName, childName, grade, username }: ProfileClientProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsPayload | null>(null);
  const [streakData, setStreakData] = useState<UserStreakPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [analyticsRes, streakRes] = await Promise.all([
        fetch('/api/me/analytics', { credentials: 'include' }),
        fetch('/api/me/streak', { credentials: 'include' }),
      ]);

      const analyticsJson = await analyticsRes.json();
      if (!analyticsRes.ok) throw new Error(analyticsJson.error || 'Failed to load analytics');
      setAnalytics(analyticsJson.analytics);

      const streakJson = await streakRes.json();
      if (streakJson.streak) setStreakData(streakJson.streak);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void load();
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
  const gradient = pickGradient(username);
  const hasNoStreakOrBadge = Boolean(streakData && streakData.currentStreak === 0 && streakData.badges.length === 0);
  const quote = useMemo(() => {
    const seed = username ?? displayName ?? 'learner';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    return MOTIVATIONAL_QUOTES[Math.abs(hash) % MOTIVATIONAL_QUOTES.length];
  }, [displayName, username]);

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* ── TOP BENTO ROW ── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr] lg:items-start">

          {/* LEFT: Profile card (via modular sub-component) */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fade}
            transition={{ duration: 0.35, type: 'tween' }}
          >
            <ProfileHeader
              avatar={avatar}
              gradient={gradient}
              firstName={firstName}
              username={username}
              displayName={displayName}
              childName={childName}
              grade={grade}
              motivationalBanner={
                hasNoStreakOrBadge ? (
                  <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-4 py-3 shadow-md">
                    <p className="font-bold text-white">🚀 Start your streak today!</p>
                    <p className="mt-1 text-sm text-indigo-100">{quote}</p>
                  </div>
                ) : undefined
              }
            />
          </motion.div>

          {/* RIGHT: Streak + Badges (via modular sub-component) */}
          <StreakSection streakData={streakData} emptyQuote={quote} />
        </section>

        {/* ── ANALYTICS ── */}
        <motion.section
          className="mt-6 rounded-2xl border border-lab-line/70 bg-white/95 p-5 shadow-sm backdrop-blur-sm sm:p-8"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.4, delay: 0.12, type: 'tween' }}
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
              <p className="mt-1 max-w-xl text-sm text-lab-soft">
                Every tap in practice is saved. Watch your reviews, strong answers, and cards that need another look.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-6 text-sm text-red-600" role="alert">{error}</p>
          )}

          {!analytics && !error && (
            <div className="mt-8 animate-pulse space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-slate-100/80" />
                ))}
              </div>
              <div className="h-52 w-full rounded-xl bg-slate-100/80" />
              <div className="h-32 w-full rounded-xl bg-slate-100/80" />
            </div>
          )}

          {analytics && (
            <>
              {/* stat cards — use modular AnalyticsStatCard */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <AnalyticsStatCard icon={<Target className="h-5 w-5 text-emerald-600" />} label="Mastered" value={analytics.cardsMastered} accent="emerald" />
                <AnalyticsStatCard icon={<Layers className="h-5 w-5 text-teal-600" />} label="Reviews" value={analytics.totalReviews} accent="teal" />
                <AnalyticsStatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Due now" value={analytics.cardsDue} accent="orange" />
                <AnalyticsStatCard icon={<BookOpen className="h-5 w-5 text-indigo-500" />} label="Decks" value={analytics.decksOwned} accent="indigo" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <MiniStat label="On-track taps" value={analytics.easyTotal} color="text-emerald-600" />
                <MiniStat label="Needs practice" value={analytics.hardTotal} color="text-orange-600" />
              </div>

              {/* 7-day chart — lazy-loaded, only renders when scrolled into view */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-zinc-800">Last 7 days</p>
                <div className="mt-3 h-52 w-full">
                  <Suspense fallback={<div className="h-52 animate-pulse rounded-xl bg-slate-100" />}>
                    <LazyBarChart data={chartData} />
                  </Suspense>
                </div>
              </div>

              {/* mastery breakdown across all decks */}
              {analytics.masteryBreakdown && (
                <div className="mt-8">
                  <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">📊 Card status breakdown</h3>
                  <p className="mt-1 text-xs text-lab-soft">How your cards are distributed across mastery levels.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2.5 text-center">
                      <p className="text-2xl font-black text-sky-700">{analytics.masteryBreakdown.new}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">New</p>
                    </div>
                    <div className="rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-2.5 text-center">
                      <p className="text-2xl font-black text-orange-700">{analytics.masteryBreakdown.learning}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">Learning</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-center">
                      <p className="text-2xl font-black text-amber-700">{analytics.masteryBreakdown.familiar}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Familiar</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 text-center">
                      <p className="text-2xl font-black text-emerald-700">{analytics.masteryBreakdown.mastered}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Mastered</p>
                    </div>
                  </div>
                </div>
              )}

              {/* struggle cards — from dedicated query */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">🧗 Struggle cards</h3>
                <p className="mt-1 text-xs text-lab-soft">Your hardest cards across all decks appear here.</p>
                <ul className="mt-3 space-y-2">
                  {(analytics.struggleCards ?? []).length === 0 ? (
                    <li className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm">
                      <span className="text-xl">💪</span>
                      <span className="text-lab-soft">No struggle cards. You are making this look easy.</span>
                    </li>
                  ) : (
                    (analytics.struggleCards ?? [])
                      .slice(0, 5)
                      .map((c) => (
                        <li key={c.id} className="rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm leading-snug">
                          <span className="line-clamp-2 font-medium text-lab-ink">{c.question}</span>
                          <span className="mt-1 block text-xs text-lab-soft">
                            {c.deckTitle} · <strong className="text-orange-600">{c.hardCount}</strong> times hard
                            {c.masteryLevel && (
                              <> · <span className="text-slate-500">{c.masteryLevel}</span></>
                            )}
                          </span>
                        </li>
                      ))
                  )}
                </ul>
              </div>

              {/* strongest cards — from dedicated query */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">
                  <BookOpen className="h-5 w-5 text-lab-teal" aria-hidden />
                  Cards you&apos;re strongest on
                </h3>
                <ul className="mt-3 space-y-2">
                  {(analytics.strongCards ?? analytics.topCards ?? []).length === 0 ? (
                    <li className="text-sm text-lab-soft">Practice a few decks to see standouts here.</li>
                  ) : (
                    (analytics.strongCards ?? analytics.topCards ?? []).map((c) => (
                      <li key={c.id} className="rounded-xl border border-lab-line/50 bg-lab-mint/30 px-4 py-3 text-sm leading-snug">
                        <span className="line-clamp-2 font-medium text-lab-ink">{c.question}</span>
                        <span className="mt-1 block text-xs text-lab-soft">
                          {c.deckTitle} · <strong className="text-lab-teal-dark">{c.easyCount}</strong> easy ·{' '}
                          <strong className="text-orange-600">{c.hardCount}</strong> hard
                          {c.masteryLevel && (
                            <> · <span className="text-slate-500">{c.masteryLevel}</span></>
                          )}
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
                    <li className="text-lab-soft">No reviews yet. Open a deck and hit Start practice.</li>
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
    </div>
  );
}



