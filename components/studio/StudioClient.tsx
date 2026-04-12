'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/cuemath/Navbar';
import { Footer } from '@/components/cuemath/Footer';
import { StudioUploadForm } from '@/components/studio/StudioUploadForm';
import { DeckList } from '@/components/DeckList';
import { TrendingUp } from 'lucide-react';

type StudioClientProps = {
  displayName: string;
};

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function StudioClient({ displayName }: StudioClientProps) {
  const [deckRefresh, setDeckRefresh] = useState(0);

  const bumpDecks = useCallback(() => {
    setDeckRefresh((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-white font-cue text-zinc-900">
      <Navbar variant="studio" />

      <main className="mx-auto max-w-4xl px-5 py-8 text-[1.0625rem] leading-relaxed sm:px-8 sm:py-12">
        <motion.header
          className="text-center"
          initial="hidden"
          animate="show"
          variants={fade}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.5rem] md:leading-tight">
            <span className="text-zinc-900">AI </span>
            <span className="rounded-xl bg-violet-600 px-3 py-1 text-[0.92em] text-white shadow-md sm:px-3.5 sm:py-1.5">
              Flashcards
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600 sm:text-lg">
            Turn any PDF into{' '}
            <span className="font-semibold text-zinc-900 underline decoration-violet-400 decoration-2 underline-offset-[5px]">
              study-ready flashcards
            </span>{' '}
            in seconds.
          </p>
          <p className="mt-4 text-sm text-zinc-500 sm:text-base">
            Hi, {displayName} — your decks & scores stay on your{' '}
            <Link href="/profile" className="font-semibold text-violet-600 underline-offset-2 hover:underline">
              profile
            </Link>
            .
          </p>
        </motion.header>

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

        <motion.div
          className="mx-auto mt-12 max-w-3xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Link
            href="/profile"
            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-violet-50/60 px-5 py-4 text-center text-base font-semibold text-violet-900 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 sm:py-5 sm:text-lg"
          >
            <TrendingUp className="h-6 w-6 shrink-0 text-violet-600" aria-hidden />
            <span>
              See how much you&apos;ve learned —{' '}
              <span className="text-violet-700 underline decoration-violet-300 underline-offset-4">open your profile</span>
            </span>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
