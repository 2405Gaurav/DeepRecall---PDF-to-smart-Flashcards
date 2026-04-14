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

// deterministic emoji avatar based on username hash
const AVATAR_EMOJIS = ['🦁', '🐯', '🦊', '🐼', '🐨', '🦄', '🐙', '🐳', '🦋', '🦚', '🦜', '🐬', '🐸', '🦝', '🐺'];

function pickAvatar(name: string | undefined): string {
  if (!name) return '🦁';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

// colorful header gradients — pick one based on username
const HEADER_GRADIENTS = [
  'from-violet-500 via-purple-600 to-indigo-700',
  'from-rose-400 via-pink-500 to-fuchsia-600',
  'from-amber-400 via-orange-500 to-red-500',
  'from-cyan-400 via-teal-500 to-blue-600',
  'from-emerald-400 via-green-500 to-teal-600',
  'from-indigo-500 via-blue-600 to-cyan-500',
  'from-fuchsia-500 via-pink-500 to-rose-500',
];

function pickGradient(name: string | undefined): string {
  if (!name) return HEADER_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return HEADER_GRADIENTS[Math.abs(hash) % HEADER_GRADIENTS.length];
}

export function ProfileClient({ displayName, childName, grade, username }: ProfileClientProps) {
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

  useEffect(() => { void load(); }, [load]);

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

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <main className="mx-auto max-w-4xl px-5 py-8 text-[1.0625rem] leading-relaxed sm:px-8 sm:py-12">

        {/* ── 1. USER INFO ── */}
        <motion.header
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-lab-line/80 bg-white/95 shadow-md backdrop-blur-sm"
        >
          {/* colorful gradient accent strip — changes per user */}
          <div className={`h-28 bg-gradient-to-r ${gradient}`} />

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            {/* avatar overlaps the accent strip */}
            <div className="-mt-10 mb-4 flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-white text-4xl shadow-lg">
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

            {/* user detail chips */}
            <div className="flex flex-wrap gap-2 text-sm">
              {childName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 font-medium text-violet-700">
                  🧒 {childName}
                </span>
              )}
              {grade && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
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

        {/* ── 2. STREAK SECTION ── */}
        <motion.section
          className="mt-8"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h2 className="font-display text-lg font-bold text-lab-ink">Streak</h2>
            {streakData && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                {streakData.currentStreak} days
              </span>
            )}
          </div>

          {streakData ? (
            <StreakBanner data={streakData} />
          ) : (
            /* skeleton while loading */
            <div className="animate-pulse h-36 rounded-2xl bg-slate-100/80" />
          )}
        </motion.section>

        {/* ── 3. BADGES SECTION ── */}
        <motion.section
          className="mt-10"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <h2 className="font-display text-lg font-bold text-lab-ink">Badges</h2>
            {streakData && streakData.badges.length > 0 && (
              <span className="rounded-full bg-lab-teal/10 px-2.5 py-0.5 text-xs font-bold text-lab-teal">
                {streakData.badges.length} earned
              </span>
            )}
          </div>

          {streakData ? (
            streakData.badges.length === 0 ? (
              <MotivationalEmptyBadges currentStreak={streakData.currentStreak} nextBadge={streakData.nextBadge} />
            ) : (
              <BadgeWall badges={streakData.badges} />
            )
          ) : (
            <div className="animate-pulse h-32 rounded-2xl bg-slate-100/80" />
          )}
        </motion.section>

        {/* ── 4. ANALYTICS SECTION ── */}
        <motion.section
          className="mt-10 rounded-2xl border border-lab-line/70 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.4, delay: 0.12 }}
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
            <p className="mt-6 text-sm text-red-600" role="alert">{error}</p>
          )}

          {/* loading skeleton */}
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
              {/* stat cards */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={<Target className="h-5 w-5 text-emerald-600" />} label="Mastered" value={analytics.cardsMastered} accent="emerald" />
                <StatCard icon={<Layers className="h-5 w-5 text-teal-600" />} label="Reviews" value={analytics.totalReviews} accent="teal" />
                <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Due now" value={analytics.cardsDue} accent="orange" />
                <StatCard icon={<BookOpen className="h-5 w-5 text-indigo-500" />} label="Decks" value={analytics.decksOwned} accent="indigo" />
              </div>

              {/* mini stats */}
              <div className="mt-4 flex flex-wrap gap-3">
                <MiniStat label="On-track taps" value={analytics.easyTotal} color="text-emerald-600" />
                <MiniStat label="Needs practice" value={analytics.hardTotal} color="text-orange-600" />
              </div>

              {/* 7-day bar chart */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-zinc-800">Last 7 days</p>
                <div className="mt-3 h-52 w-full" style={{ minWidth: 200, minHeight: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#a8cfc7" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 13 }}
                      />
                      <Bar dataKey="easy" stackId="a" fill="#0f766e" name="On track" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hard" stackId="a" fill="#f97316" name="Practice more" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* mastery breakdown across all decks */}
              {analytics.masteryBreakdown && (
                <div className="mt-8">
                  <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">
                    📊 Card status breakdown
                  </h3>
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

              {/* struggle cards — now from dedicated query */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-lab-ink">
                  🧗 Struggle cards
                </h3>
                <p className="mt-1 text-xs text-lab-soft">Your hardest cards across all decks — the algorithm will show these more often.</p>
                <ul className="mt-3 space-y-2">
                  {(analytics.struggleCards ?? []).length === 0 ? (
                    <li className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm">
                      <span className="text-xl">💪</span>
                      <span className="text-lab-soft">No struggle cards. You are making this look easy.</span>
                    </li>
                  ) : (
                    (analytics.struggleCards ?? []).slice(0, 5).map((c) => (
                      <li key={c.id} className="rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm leading-snug">
                        <span className="font-medium text-lab-ink line-clamp-2">{c.question}</span>
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

              {/* strongest cards — now from dedicated query */}
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
                        <span className="font-medium text-lab-ink line-clamp-2">{c.question}</span>
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
    </div>
  );
}

/* ── Motivational empty-badges card ── */
const MOTIVATIONAL_QUOTES = [
  "Every expert was once a beginner. Start your streak today! 🌱",
  "Small steps every day lead to massive results. Practice once and begin! 💪",
  "The journey of a thousand miles starts with a single step. Open a deck! 🚀",
  "Champions train every day. Your first badge is just 3 days away! 🏅",
  "Consistency beats talent. Show up today and earn your first badge! ⭐",
];

function MotivationalEmptyBadges({
  currentStreak,
  nextBadge,
}: {
  currentStreak: number;
  nextBadge: UserStreakPayload['nextBadge'];
}) {
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const daysToNext = nextBadge ? nextBadge.streak - currentStreak : 3;

  return (
    <motion.div
      className="rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 py-10 px-6 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.span
        className="block text-5xl"
        animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎖️
      </motion.span>
      <p className="mt-4 font-display text-base font-bold text-indigo-700">No badges yet — but you&apos;re on your way!</p>
      <p className="mx-auto mt-2 max-w-xs text-sm text-indigo-500 italic">&ldquo;{quote}&rdquo;</p>
      {nextBadge && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/90 border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
          <span>{nextBadge.emoji}</span>
          <span>
            {daysToNext <= 0
              ? `Practice today to earn "${nextBadge.title}"!`
              : `${daysToNext} more day${daysToNext !== 1 ? 's' : ''} to earn "${nextBadge.title}"`}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Stat card with icon ── */
function StatCard({
  icon, label, value, accent,
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
