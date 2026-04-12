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
import type { UserAnalyticsPayload } from '@/lib/user-analytics';
import { TrendingUp, BookOpen, UserRound } from 'lucide-react';

type ProfileClientProps = {
  displayName: string;
  childName: string | null;
  grade: string | null;
};

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function ProfileClient({ displayName, childName, grade }: ProfileClientProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsPayload | null>(null);
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
  }, [load]);

  const chartData =
    analytics?.last7Days.map((d) => ({
      day: d.day.slice(5),
      reviews: d.count,
      easy: d.easy,
      hard: d.hard,
    })) ?? [];

  const firstName = displayName?.split(' ')[0] ?? 'Learner';

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar variant="studio" />

      <main className="mx-auto max-w-4xl px-5 py-8 text-[1.0625rem] leading-relaxed sm:px-8 sm:py-12">
        <motion.header
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-lab-line/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lab-mint text-lab-teal-dark">
              <UserRound className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-lab-teal-dark sm:text-3xl">
                Your profile
              </h1>
              <p className="mt-1 text-base text-lab-soft">
                Hi, <span className="font-semibold text-lab-ink">{firstName}</span> — here&apos;s who&apos;s learning
                and how it&apos;s going.
              </p>
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-lab-soft">
                {childName && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lab-soft/80">Learner</dt>
                    <dd className="font-medium text-lab-ink">{childName}</dd>
                  </div>
                )}
                {grade && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-lab-soft/80">Grade</dt>
                    <dd className="font-medium text-lab-ink">{grade}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-lab-soft/80">Name on account</dt>
                  <dd className="font-medium text-lab-ink">{displayName || '—'}</dd>
                </div>
              </dl>
              <Link
                href="/studio"
                className="mt-5 inline-flex text-sm font-semibold text-lab-teal hover:text-lab-teal-dark hover:underline"
              >
                ← Back to studio
              </Link>
            </div>
          </div>
        </motion.header>

        <motion.section
          className="mt-10 rounded-2xl border border-lab-line/70 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          transition={{ duration: 0.4, delay: 0.05 }}
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

          {analytics && (
            <>
              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Reviews logged" value={analytics.totalReviews} />
                <Stat label="Your decks" value={analytics.decksOwned} />
                <Stat label="On-track taps" value={analytics.easyTotal} accent="text-emerald-600" />
                <Stat label="Due now" value={analytics.cardsDue} accent="text-amber-600" />
              </dl>

              <div className="mt-8">
                <p className="text-sm font-semibold text-zinc-800">Last 7 days</p>
                <div className="mt-3 h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
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

              <div className="mt-8">
                <h3 className="text-base font-bold text-lab-ink">Recent activity</h3>
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-lab-line/50 bg-white/80 py-3 text-center">
      <dt className="px-2 text-[10px] font-semibold uppercase tracking-wide text-lab-soft">{label}</dt>
      <dd className={`mt-1 text-2xl font-bold text-lab-ink ${accent ?? ''}`}>{value}</dd>
    </div>
  );
}
