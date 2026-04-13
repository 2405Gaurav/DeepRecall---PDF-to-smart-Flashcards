'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Table2, MonitorSmartphone, LineChart, Trophy } from 'lucide-react';

const FEATURES = [
  {
    id: 'teacher-cards',
    title: 'Teacher-quality cards',
    body: 'PDFs become recall-heavy questions — concepts, definitions, links between ideas — not shallow bullet dumps.',
    Icon: Table2,
    image: '/images/child-flashcards.png',
    emoji: '📝',
  },
  {
    id: 'spaced-repetition',
    title: 'Spaced repetition built in',
    body: "What you nail shows up later; what's shaky returns sooner — SM-2 style scheduling.",
    Icon: MonitorSmartphone,
    image: '/images/child-spaced-repetition.png',
    emoji: '🔄',
  },
  {
    id: 'progress',
    title: 'Progress you can feel',
    body: 'Mastery, due-now counts, and last-practiced cues across all decks — motivating without noise.',
    Icon: LineChart,
    image: '/images/child-progress.png',
    emoji: '📈',
  },
  {
    id: 'streaks-badges',
    title: 'Streaks, badges & milestones',
    body: 'Daily streaks earn badges at 3, 7, 15, and 30 days. Kids love watching their trophy wall grow! 🏆',
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
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 md:py-14"
      aria-labelledby="cue-flashcard-heading"
    >
      <div className="overflow-hidden rounded-3xl border border-lab-line/90 bg-white/90 shadow-sm">
        {/* equal two-column grid — items-stretch makes both cols the same height */}
        <div className="grid items-stretch md:grid-cols-2">

          {/* ── LEFT: image panel fills full column height ── */}
          <div className="relative bg-gradient-to-br from-lab-mint/60 via-sky-50/50 to-violet-50/40">
            {/* decorative blobs */}
            <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-lab-teal/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-pink-200/20 blur-2xl" />

            {/* image swap — fills the full height of the left column */}
            <div className="relative flex h-full min-h-[340px] items-center justify-center p-6 md:min-h-0 md:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeFeature.id}
                  className="relative w-full"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: 'easeOut', type: 'tween' }}
                >
                  <Image
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    width={520}
                    height={390}
                    className="mx-auto w-full max-w-sm rounded-2xl shadow-lg md:max-w-full"
                    priority={activeIndex === 0}
                    sizes="(max-width: 768px) 90vw, 50vw"
                  />

                  {/* floating emoji badge */}
                  <motion.div
                    className="absolute -right-1 -top-1 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg md:-right-3 md:-top-3 md:h-13 md:w-13"
                    animate={{ y: [0, -6] }}
                    transition={{ duration: 1.0, repeat: Infinity, repeatType: 'mirror', type: 'tween', ease: 'easeInOut' }}
                  >
                    <span className="text-xl md:text-2xl">{activeFeature.emoji}</span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* dot indicators */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {FEATURES.map((f, i) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? 'w-5 bg-lab-teal' : 'w-1.5 bg-lab-teal/30 hover:bg-lab-teal/50'
                    }`}
                    aria-label={`Show ${f.title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: feature list ── */}
          <div className="flex flex-col justify-center p-7 md:p-10">
            <h2
              id="cue-flashcard-heading"
              className="font-display text-2xl font-bold leading-tight tracking-tight text-lab-ink sm:text-3xl md:text-[2rem]"
            >
              A <span className="text-pink-600">Cue-flashcard</span> lab for your notes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-lab-soft sm:text-base">
              Built around long-term retention: strong ingestion, smart scheduling, clear progress,
              streaks &amp; badges — light and playful for learners.
            </p>

            <ul className="mt-6 space-y-1.5">
              {FEATURES.map(({ id, title, body, Icon, emoji }, i) => {
                const isActive = i === activeIndex;
                return (
                  <motion.li
                    key={id}
                    onClick={() => setActiveIndex(i)}
                    className={`cursor-pointer rounded-xl border px-3.5 py-3 transition-all ${
                      isActive
                        ? 'border-lab-teal/40 bg-lab-mint/40 shadow-sm ring-1 ring-lab-teal/20'
                        : 'border-transparent hover:border-lab-line/60 hover:bg-white/60'
                    }`}
                    whileHover={{ x: isActive ? 0 : 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className="flex gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isActive ? 'bg-pink-600 text-white' : 'border-2 border-pink-500 text-pink-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.75} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-lab-ink">
                          {emoji} {title}
                        </p>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.p
                              className="mt-0.5 text-xs leading-relaxed text-lab-soft"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22, type: 'tween' }}
                            >
                              {body}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      {isActive && (
                        <motion.span
                          className="mt-0.5 text-sm text-lab-teal"
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
              className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-pink-600 transition hover:text-pink-700"
            >
              Try it in your studio <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
