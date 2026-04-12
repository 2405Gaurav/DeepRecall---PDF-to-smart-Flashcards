'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Handshake, Target, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/cuemath/Navbar';
import { Footer } from '@/components/cuemath/Footer';
import { OnboardingModal } from '@/components/cuemath/OnboardingModal';
import { SlideCtaButton, SlideCtaLink } from '@/components/ui/SlideCtaButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = [
  {
    q: 'What is Cuemath Flashcards?',
    a: 'A MathFit™-style learning lab: turn PDF notes into AI flashcards, then review with spaced repetition. Your reviews and stats stay on your profile in the studio.',
  },
  {
    q: 'Where do I create decks?',
    a: 'Complete Get started once, then open Your studio. Uploads require a short login (onboarding) so decks attach to you.',
  },
  {
    q: 'Is my phone number verified with OTP?',
    a: 'Not yet — we accept a dummy number for now. OTP can replace that step later.',
  },
  {
    q: 'Which PDFs work best?',
    a: 'Text-based PDFs work well. Image-only scans may not extract enough text.',
  },
] as const;

function HomeInner() {
  const searchParams = useSearchParams();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [justFinishedOnboarding, setJustFinishedOnboarding] = useState(false);
  const [sessionUser, setSessionUser] = useState<{
    displayName: string | null;
    onboarded: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/me/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setSessionUser({
            displayName: d.user.displayName,
            onboarded: d.user.onboarded,
          });
        } else {
          setSessionUser(null);
        }
      })
      .catch(() => setSessionUser(null));
  }, [justFinishedOnboarding]);

  useEffect(() => {
    if (searchParams.get('studio') === 'login') {
      setOnboardingOpen(true);
    }
  }, [searchParams]);

  const showReadyCta = Boolean(sessionUser?.onboarded || justFinishedOnboarding);

  const handleOnboardingDone = useCallback(() => {
    setJustFinishedOnboarding(true);
  }, []);

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar onGetStarted={() => setOnboardingOpen(true)} />
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onComplete={handleOnboardingDone}
      />

      <section className="mx-auto max-w-5xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 md:pt-20">
        <motion.p
          className="text-center text-sm font-semibold uppercase tracking-[0.28em] text-lab-teal sm:text-base"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Cuemath · MathFit™ learning lab
        </motion.p>
        <motion.h1
          className="mx-auto mt-6 max-w-4xl text-center font-display text-4xl font-bold leading-[1.08] tracking-tight text-lab-teal-dark sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          A Personalized MathFit™ Journey — with Smart Flashcards
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-lab-soft sm:text-xl md:text-2xl md:leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          Our PDF flashcard lab builds active recall decks from your notes so you can practice daily and stay
          MathFit™ for exams and beyond — with a calmer, teal-and-coral tone built for focus.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SlideCtaButton onClick={() => setOnboardingOpen(true)}>Get Started</SlideCtaButton>
          <Link
            href="/studio"
            className="text-base font-semibold text-lab-teal underline-offset-4 transition hover:text-lab-teal-dark hover:underline sm:text-lg"
          >
            Already set up? Open your studio →
          </Link>
        </motion.div>
      </section>

      {showReadyCta && (
        <motion.div
          className="mx-auto max-w-4xl px-4 sm:px-6"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-lab-teal/40 bg-white/95 px-6 py-8 text-center shadow-lg sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div>
              <p className="font-display text-xl font-bold text-lab-teal-dark sm:text-2xl md:text-3xl">
                You&apos;re all set — let&apos;s create flashcards and study
              </p>
              <p className="mt-2 text-base text-lab-soft sm:text-lg">
                Your studio has the generator, your decks, and personal analytics (reviews, high scores, growth).
              </p>
            </div>
            <SlideCtaLink href="/studio" className="shrink-0">
              Open your studio →
            </SlideCtaLink>
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
            body: 'Bring your own PDFs — every deck and stat is tied to your studio login.',
            Icon: Target,
            bg: 'bg-lab-sand/90',
            iconClass: 'text-lab-coral',
          },
        ].map(({ title, body, Icon, bg, iconClass }, i) => (
          <motion.article
            key={title}
            className={`relative overflow-hidden rounded-2xl border border-lab-line/80 ${bg} p-7 pt-12 shadow-sm md:p-8 md:pt-14`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Icon className={`absolute right-5 top-5 h-11 w-11 md:h-12 md:w-12 ${iconClass}`} aria-hidden />
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
              calmer study sessions. Complete <strong>Get started</strong> once, then use <strong>Your studio</strong>{' '}
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
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <SlideCtaButton onClick={() => setOnboardingOpen(true)}>Get Started</SlideCtaButton>
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
