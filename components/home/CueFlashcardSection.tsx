'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Table2, MonitorSmartphone, LineChart, Trophy, Flame } from 'lucide-react';

// each feature has a title, body, icon, and a matching image on the left
const FEATURES = [
  {
    id: 'teacher-cards',
    title: 'Teacher-quality cards',
    body: 'PDFs become recall-heavy questions — concepts, definitions, links between ideas, and examples — not shallow bullet dumps.',
    Icon: Table2,
    image: '/images/child-flashcards.png',
    emoji: '📝',
  },
  {
    id: 'spaced-repetition',
    title: 'Spaced repetition built in',
    body: "What you nail shows up later; what's shaky returns sooner — scheduling inspired by proven spaced-review ideas (SM-2 style).",
    Icon: MonitorSmartphone,
    image: '/images/child-spaced-repetition.png',
    emoji: '🔄',
  },
  {
    id: 'progress',
    title: 'Progress you can feel',
    body: 'Mastery, "due now," and last-practiced cues across many decks — motivating without a wall of numbers.',
    Icon: LineChart,
    image: '/images/child-progress.png',
    emoji: '📈',
  },
  {
    id: 'streaks-badges',
    title: 'Streaks, badges & milestones',
    body: 'Daily practice streaks earn badges at 3, 7, 15, and 30 days. Track your personal milestones — kids love watching their trophy wall grow! 🏆',
    Icon: Trophy,
    image: '/images/child-badges.png',
    emoji: '🔥',
  },
] as const;

export function CueFlashcardSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURES[activeIndex];

  return (
    <section
      id="cue-flashcard"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 md:py-20"
      aria-labelledby="cue-flashcard-heading"
    >
      <div className="overflow-hidden rounded-3xl border border-lab-line/90 bg-white/90 shadow-sm">
        <div className="grid gap-10 p-8 md:grid-cols-2 md:gap-12 md:p-12 lg:gap-16">
          {/* left side — interactive image that changes based on selected feature */}
          <motion.div
            className="relative min-h-[320px] md:min-h-[420px]"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-lab-mint/60 via-sky-50/50 to-violet-50/40">
              {/* decorative blob shapes */}
              <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-lab-teal/10 blur-2xl" />
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-pink-200/20 blur-2xl" />
            </div>

            <div className="relative flex h-full items-center justify-center p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  className="relative w-full"
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    width={480}
                    height={360}
                    className="mx-auto rounded-xl shadow-lg"
                    priority={activeIndex === 0}
                  />

                  {/* floating emoji badge in corner */}
                  <motion.div
                    className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg md:-right-3 md:-top-3 md:h-14 md:w-14"
                    animate={{ y: [0, -5, 0], rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="text-2xl md:text-3xl">{activeFeature.emoji}</span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* feature indicator dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {FEATURES.map((f, i) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? 'w-6 bg-lab-teal'
                      : 'w-2 bg-lab-teal/30 hover:bg-lab-teal/50'
                  }`}
                  aria-label={`Show ${f.title}`}
                />
              ))}
            </div>
          </motion.div>

          {/* right side — interactive feature list */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <h2
              id="cue-flashcard-heading"
              className="font-display text-3xl font-bold leading-tight tracking-tight text-lab-ink sm:text-4xl md:text-[2.25rem] md:leading-[1.15]"
            >
              A <span className="text-pink-600">Cue-flashcard</span> lab for your notes
            </h2>
            <p className="mt-4 text-base leading-relaxed text-lab-soft sm:text-lg">
              Built around long-term retention: strong ingestion, smart scheduling after you practice,
              clear progress, streaks & badges — still light and playful for learners.
            </p>

            <ul className="mt-8 space-y-2">
              {FEATURES.map(({ id, title, body, Icon, emoji }, i) => {
                const isActive = i === activeIndex;
                return (
                  <motion.li
                    key={id}
                    onClick={() => setActiveIndex(i)}
                    className={`cursor-pointer rounded-xl border px-4 py-3.5 transition-all ${
                      isActive
                        ? 'border-lab-teal/40 bg-lab-mint/40 shadow-sm ring-1 ring-lab-teal/20'
                        : 'border-transparent bg-transparent hover:border-lab-line/60 hover:bg-white/60'
                    }`}
                    whileHover={{ x: isActive ? 0 : 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className="flex gap-3">
                      <motion.div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive ? 'bg-pink-600 text-white' : 'border-2 border-pink-500 text-pink-600'
                        }`}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.75} aria-hidden />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-bold text-lab-ink md:text-base">
                          {emoji} {title}
                        </p>
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              className="mt-1 text-sm leading-relaxed text-lab-soft"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {body}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      {isActive && (
                        <motion.span
                          className="mt-1 text-lab-teal"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <Link
              href="/studio"
              className="mt-8 inline-flex items-center gap-1 text-base font-bold text-pink-600 transition hover:text-pink-700"
            >
              Try it in your studio <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
