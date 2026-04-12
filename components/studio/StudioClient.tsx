'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { UploadForm } from '@/components/UploadForm';
import { DeckList } from '@/components/DeckList';
import type { UserAnalyticsPayload } from '@/lib/user-analytics';
import { TrendingUp, Flame, Target, BookOpen } from 'lucide-react';

type StudioClientProps = {
  displayName: string;
};

const sectionFade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function StudioClient({ displayName }: StudioClientProps) {
  const [analytics, setAnalytics] = useState<UserAnalyticsPayload | null>(null);
  const [deckRefresh, setDeckRefresh] = useState(0);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/me/analytics', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
      setAnalytics(json.analytics);
      setAnalyticsError(null);
    } catch (e) {
      setAnalyticsError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics, deckRefresh]);

  const chartData =
    analytics?.last7Days.map((d) => ({
      day: d.day.slice(5),
      reviews: d.count,
      easy: d.easy,
      hard: d.hard,
    })) ?? [];

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar onGetStarted={() => {}} variant="studio" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <motion.header
          className="text-center lg:text-left"
          initial="hidden"
          animate="show"
          variants={sectionFade}
          transition={{ duration: 0.45 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-lab-teal">Your learning studio</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-lab-teal-dark sm:text-5xl md:text-6xl">
            Hi, {displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-lab-soft sm:text-xl md:text-2xl lg:mx-0 mx-auto">
            Build decks from PDFs, track every review, and watch your recall grow — your progress stays on{' '}
            <span className="font-semibold text-lab-teal">your</span> profile only.
          </p>
        </motion.header>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <motion.aside
            className="space-y-8 lg:col-span-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={sectionFade}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-2xl border-2 border-lab-line bg-white/90 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-lab-teal-dark">
                <TrendingUp className="h-5 w-5 text-lab-coral" aria-hidden />
                Explore your growth
              </h2>
              <p className="mt-2 text-sm text-lab-soft">
                Reviews and &quot;Easy&quot; wins from decks you own. High score per card = total Easy taps.
              </p>

              {analyticsError && (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {analyticsError}
                </p>
              )}

              {analytics && (
                <>
                  <dl className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-lab-mint/60 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-lab-soft">Reviews</dt>
                      <dd className="mt-1 font-display text-3xl font-bold text-lab-teal-dark">
                        {analytics.totalReviews}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-lab-sand/80 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-lab-soft">Decks</dt>
                      <dd className="mt-1 font-display text-3xl font-bold text-lab-teal-dark">
                        {analytics.decksOwned}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-lab-lilac/50 p-4">
                      <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-lab-soft">
                        <Flame className="h-3.5 w-3.5" aria-hidden />
                        Easy wins
                      </dt>
                      <dd className="mt-1 font-display text-2xl font-bold text-lab-teal-dark">
                        {analytics.easyTotal}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white p-4 ring-1 ring-lab-line">
                      <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-lab-soft">
                        <Target className="h-3.5 w-3.5" aria-hidden />
                        Due now
                      </dt>
                      <dd className="mt-1 font-display text-2xl font-bold text-lab-coral">
                        {analytics.cardsDue}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 h-56 w-full">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-lab-soft">
                      Last 7 days
                    </p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#cfe8e2" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#64748b" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #a8cfc7',
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="easy" stackId="a" fill="#0f766e" name="Easy" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="hard" stackId="a" fill="#ea580c" name="Hard" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-lab-teal-dark">
                      <BookOpen className="h-4 w-4" aria-hidden />
                      Top cards (high score)
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {analytics.topCards.length === 0 ? (
                        <li className="text-lab-soft">Review a few cards to see your standouts here.</li>
                      ) : (
                        analytics.topCards.map((c) => (
                          <li
                            key={c.id}
                            className="rounded-lg border border-lab-line bg-white/80 px-3 py-2.5 leading-snug"
                          >
                            <span className="font-medium text-lab-ink line-clamp-2">{c.question}</span>
                            <span className="mt-1 block text-xs text-lab-soft">
                              {c.deckTitle} · <strong className="text-lab-teal">{c.easyCount}</strong> easy ·{' '}
                              <strong className="text-lab-coral">{c.hardCount}</strong> hard
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-lab-teal-dark">Recent history</h3>
                    <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-xs text-lab-soft">
                      {analytics.recentActivity.length === 0 ? (
                        <li>No reviews logged yet.</li>
                      ) : (
                        analytics.recentActivity.map((r, i) => (
                          <li key={`${r.at}-${i}`} className="border-b border-lab-line/60 pb-2">
                            <span className={r.outcome === 'EASY' ? 'text-lab-teal' : 'text-lab-coral'}>
                              {r.outcome}
                            </span>{' '}
                            · {r.deckTitle}
                            <br />
                            <span className="text-lab-ink/80">{r.questionSnippet}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </motion.aside>

          <motion.section
            className="lg:col-span-7"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={sectionFade}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-2xl border-2 border-lab-teal/30 bg-white/95 p-6 shadow-lg sm:p-8 md:p-10">
              <h2 className="font-display text-2xl font-bold text-lab-teal-dark sm:text-3xl md:text-4xl">
                Create flashcards
              </h2>
              <p className="mt-3 text-base text-lab-soft sm:text-lg">
                Upload a PDF — we extract text, generate cards with AI, and save them to your account.
              </p>
              <div className="mt-8">
                <UploadForm
                  onSuccess={() => {
                    setDeckRefresh((k) => k + 1);
                    void loadAnalytics();
                  }}
                />
              </div>
              <div className="mt-12">
                <h3 className="font-display text-xl font-bold text-lab-teal-dark">Your decks</h3>
                <DeckList refreshKey={deckRefresh} />
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
