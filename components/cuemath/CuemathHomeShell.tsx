'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Handshake, Target, Sparkles, User } from 'lucide-react';
import { Navbar } from '@/components/cuemath/Navbar';
import { CueFlashcardSection } from '@/components/cuemath/CueFlashcardSection';
import { Footer } from '@/components/cuemath/Footer';
import { AuthModal } from '@/components/cuemath/AuthModal';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { StreakBanner } from '@/components/ui/BadgeDisplay';
import type { UserStreakPayload } from '@/lib/streaks';
import { SlideCtaButton, SlideCtaLink } from '@/components/ui/SlideCtaButton';
import { useAuth } from '@/hooks/useAuth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = [
  {
    q: 'What is Cuemath Flashcards?',
    a: 'A DeepRecall lab for long-term memory: PDFs become recall-heavy flashcards (not shallow trivia), practice uses spaced-style scheduling so easy cards fade out and hard ones return sooner, and your profile shows progress across decks.',
  },
  {
    q: 'Where do I create decks?',
    a: 'Sign up or log in, then open Your studio. Uploads are tied to your account so decks are always accessible.',
  },
  {
    q: 'How do I sign up or log in?',
    a: 'Choose a username and password — that\'s it! After signing up, you\'ll fill in your name and grade so we can personalize your experience. Returning users just log in and go straight to the studio.',
  },
  {
    q: 'Which PDFs work best?',
    a: 'Text-based PDFs work well. Image-only scans may not extract enough text.',
  },
  {
    q: 'How do streaks and badges work?',
    a: 'Every day you practice at least one card, your streak goes up by 1. Miss a day and it resets. Hit milestones like 3, 7, 15, or 30 days and you earn a badge — permanently! Your profile keeps a trophy wall of every badge you have collected so far.',
  },
  {
    q: 'What does the spaced repetition algorithm actually do?',
    a: "We use an SM-2 inspired system. When you mark a card as 'mastered,' it won't show again for several days. Cards marked 'still learning' come right back. The intervals grow — 1 day, 3 days, 7 days, 14 days — so you review tough cards more and easy ones less. It's math that helps your brain!",
  },
  {
    q: 'Can I use this on my phone or tablet?',
    a: 'Yes! The app is fully responsive — it works in any modern browser on phones, tablets, and desktops. No app install needed. Just open your studio URL and start practicing anywhere.',
  },
] as const;

function HomeInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [streakData, setStreakData] = useState<UserStreakPayload | null>(null);

  const isLoggedIn = !!user?.onboarded;

  // fetch streak data when user changes
  useEffect(() => {
    if (user) {
      fetch('/api/me/streak', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => { if (d.streak) setStreakData(d.streak); })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('studio') === 'login') {
      setAuthMode('login');
      setAuthOpen(true);
    }
  }, [searchParams]);

  const openLogin = () => { setAuthMode('login'); setAuthOpen(true); };
  const openSignup = () => { setAuthMode('signup'); setAuthOpen(true); };

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar
        onGetStarted={openSignup}
        onLogin={openLogin}
      />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
      />

      <section className="relative mx-auto max-w-5xl px-4 pb-6 pt-10 sm:px-6 sm:pt-12 md:pt-14">
        {/* floating emoji particles in hero */}
        <FloatingParticles />

        <motion.div
          className="mx-auto mb-4 flex justify-center"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <motion.span
            className="text-5xl select-none"
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧠
          </motion.span>
        </motion.div>
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-lab-teal sm:text-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Cuemath · DeepRecall learning lab
        </motion.p>
        <motion.h1
          className="mx-auto mt-5 max-w-3xl text-center font-display text-3xl font-bold leading-[1.12] tracking-tight text-lab-teal-dark sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        >
          A Personalized DeepRecall Journey — with Smart Flashcards ✨
        </motion.h1>
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-lab-soft sm:text-lg md:text-xl md:leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Our PDF flashcard lab builds active recall decks from your notes so you can practice daily and stay
          sharp for exams and beyond — with a calmer, teal-and-coral tone built for focus.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {isLoggedIn ? (
            <>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <SlideCtaLink href="/studio">📚 Open Studio</SlideCtaLink>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-lab-teal px-5 py-3 text-sm font-bold text-lab-teal transition hover:bg-lab-teal hover:text-white"
                >
                  <User className="h-4 w-4" /> My Profile
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <SlideCtaButton onClick={openSignup}>🚀 Sign Up</SlideCtaButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={openLogin}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-lab-teal px-5 py-3 text-sm font-bold text-lab-teal transition hover:bg-lab-teal hover:text-white"
                >
                  🔑 Log In
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* streak banner for logged-in users */}
      {isLoggedIn && streakData && (
        <motion.div
          className="mx-auto max-w-xl px-4 pt-6 sm:px-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <StreakBanner data={streakData} compact />
        </motion.div>
      )}

      <CueFlashcardSection />

      {/* logged-in user quick access panel */}
      {isLoggedIn && (
        <motion.div
          className="mx-auto max-w-4xl px-4 sm:px-6"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-lab-teal/40 bg-white/95 px-6 py-8 text-center shadow-lg sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div>
              <p className="font-display text-xl font-bold text-lab-teal-dark sm:text-2xl md:text-3xl">
                Welcome back, {user?.displayName || 'Learner'}! 👋
              </p>
              <p className="mt-2 text-base text-lab-soft sm:text-lg">
                Your studio has the generator, your decks, and personal analytics.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <SlideCtaLink href="/studio" className="shrink-0">
                Open Studio →
              </SlideCtaLink>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-lab-teal px-4 py-3 text-sm font-bold text-lab-teal transition hover:bg-lab-teal hover:text-white"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:grid-cols-3 sm:gap-6 sm:px-6 md:py-20" id="how-it-works">
        {[
          {
            title: 'TOP 1% STUDY DESIGN',
            body: 'Cards emphasize concepts, definitions, relationships, and examples — not shallow trivia.',
            Icon: Trophy,
            bg: 'bg-lab-mint/90',
            iconClass: 'text-lab-teal-dark',
          },
          {
            title: 'FOR THE LONG TERM',
            body: 'Spaced repetition brings back tough cards and fades what you already know.',
            Icon: Handshake,
            bg: 'bg-lab-lilac/80',
            iconClass: 'text-violet-600',
          },
          {
            title: 'PERFECT MATCH',
            body: 'Bring your own PDFs — every deck and stat is tied to your account.',
            Icon: Target,
            bg: 'bg-lab-sand/90',
            iconClass: 'text-lab-coral',
          },
        ].map(({ title, body, Icon, bg, iconClass }, i) => (
          <motion.article
            key={title}
            className={`relative overflow-hidden rounded-2xl border border-lab-line/80 ${bg} p-7 pt-12 shadow-sm md:p-8 md:pt-14 cursor-pointer`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -6,
              scale: 1.02,
              rotate: i % 2 === 0 ? 1 : -1,
              transition: { type: 'spring', stiffness: 380, damping: 22 },
            }}
          >
            <motion.div
              className={`absolute right-5 top-5`}
              animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            >
              <Icon className={`h-11 w-11 md:h-12 md:w-12 ${iconClass}`} aria-hidden />
            </motion.div>
            <h2 className="font-display text-sm font-bold tracking-wide text-lab-teal-dark md:text-base">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-lab-soft md:text-lg">{body}</p>
          </motion.article>
        ))}
      </section>

      <section id="about-service" className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex gap-4 rounded-2xl border border-lab-line bg-white/90 p-6 shadow-sm md:p-8">
          <Sparkles className="mt-1 h-7 w-7 shrink-0 text-lab-coral" aria-hidden />
          <div>
            <h2 className="font-display text-base font-bold text-lab-teal-dark md:text-lg">Cuemath Flashcards lab</h2>
            <p className="mt-3 text-base leading-relaxed text-lab-soft md:text-lg">
              Inspired by Cuemath, with a <strong className="text-lab-ink">distinct teal & coral</strong> palette for
              calmer study sessions. Sign up once, then use <strong>Your studio</strong>{' '}
              to upload PDFs, review cards, and see your growth over time.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24">
        <h2 className="text-center font-display text-3xl font-bold text-lab-teal-dark sm:text-4xl md:text-5xl">
          We love solving doubts!
        </h2>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-lab-line">
              <AccordionTrigger className="text-left text-base font-semibold text-lab-teal-dark hover:no-underline md:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-lab-soft md:text-lg">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <motion.div
          className="mt-12 flex justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {isLoggedIn ? (
            <SlideCtaLink href="/studio">Open Studio</SlideCtaLink>
          ) : (
            <>
              <SlideCtaButton onClick={openSignup}>Get Started</SlideCtaButton>
              <button
                onClick={openLogin}
                className="rounded-full border-2 border-lab-teal px-6 py-3 text-sm font-bold text-lab-teal transition hover:bg-lab-teal hover:text-white"
              >
                Log In
              </button>
            </>
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

export function CuemathHomeShell() {
  return (
    <Suspense
      fallback={<div className="min-h-screen animate-pulse bg-lab-grid" aria-hidden />}
    >
      <HomeInner />
    </Suspense>
  );
}
