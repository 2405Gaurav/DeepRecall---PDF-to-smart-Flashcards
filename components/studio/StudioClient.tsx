'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/cuemath/Navbar';
import { Footer } from '@/components/cuemath/Footer';
import { StudioUploadForm } from '@/components/studio/StudioUploadForm';
import { DeckList } from '@/components/DeckList';
import { TrendingUp, Sparkles } from 'lucide-react';
import { StreakBanner, BadgeWall } from '@/components/ui/BadgeDisplay';
import type { UserStreakPayload } from '@/lib/streaks';

type StudioClientProps = {
  displayName: string;
};

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function StudioClient({ displayName }: StudioClientProps) {
  const [deckRefresh, setDeckRefresh] = useState(0);
  const [streakData, setStreakData] = useState<UserStreakPayload | null>(null);

  const bumpDecks = useCallback(() => {
    setDeckRefresh((k) => k + 1);
  }, []);

  // fetch streak data on mount
  useEffect(() => {
    fetch('/api/me/streak', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.streak) setStreakData(d.streak);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar variant="studio" />

      <main className="mx-auto max-w-4xl px-5 py-8 text-[1.0625rem] leading-relaxed sm:px-8 sm:py-12">
        <motion.header
          className="text-center"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.35 }}
        >
          {/* bouncy brain mascot */}
          <motion.div
            className="mx-auto mb-3 w-fit"
            animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-4xl select-none">🧪</span>
          </motion.div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.5rem] md:leading-tight">
            <span className="text-lab-ink">AI </span>
            <motion.span
              className="inline-block rounded-xl bg-lab-teal px-3 py-1 text-[0.92em] text-white shadow-md sm:px-3.5 sm:py-1.5"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              ✨ Flashcards
            </motion.span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-lab-soft sm:text-lg">
            Turn any PDF into{' '}
            <span className="font-semibold text-lab-ink underline decoration-lab-line decoration-2 underline-offset-[5px]">
              study-ready flashcards
            </span>{' '}
            in seconds. 🚀
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-lab-teal sm:text-sm">
            DeepRecall · recall for any subject
          </p>
          <motion.p
            className="mt-4 text-sm text-lab-soft sm:text-base"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Hi, {displayName} 👋 — your decks & scores stay on your{' '}
            <Link href="/profile" className="font-semibold text-lab-teal underline-offset-2 hover:underline">
              profile
            </Link>
            .
          </motion.p>
        </motion.header>

        {/* streak banner — shows current streak + next badge */}
        {streakData && (
          <motion.section
            className="mx-auto mt-8 max-w-3xl"
            initial="hidden"
            animate="show"
            variants={fade}
            transition={{ duration: 0.35, delay: 0.04 }}
          >
            <StreakBanner data={streakData} compact />
          </motion.section>
        )}

        <motion.section
          className="mx-auto mt-10 max-w-3xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <StudioUploadForm onSuccess={bumpDecks} />
        </motion.section>

        <motion.section
          className="mx-auto mt-12 max-w-3xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <DeckList refreshKey={deckRefresh} compact />
        </motion.section>

        {/* badges section — only show if user has earned any */}
        {streakData && streakData.badges.length > 0 && (
          <motion.section
            className="mx-auto mt-12 max-w-3xl"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fade}
            transition={{ duration: 0.35, delay: 0.1 }}
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

        <motion.div
          className="mx-auto mt-12 max-w-3xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Link
              href="/profile"
              className="flex items-center justify-center gap-3 rounded-2xl border-2 border-lab-line/90 bg-lab-mint/50 px-5 py-4 text-center text-base font-semibold text-lab-teal-dark shadow-sm transition hover:border-lab-teal/40 hover:bg-lab-mint sm:py-5 sm:text-lg"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <TrendingUp className="h-6 w-6 shrink-0 text-lab-teal" aria-hidden />
              </motion.span>
              <span>
                See how much you&apos;ve learned 📊 —{' '}
                <span className="text-lab-teal-dark underline decoration-lab-line underline-offset-4">open your profile</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
