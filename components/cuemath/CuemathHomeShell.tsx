'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { CueFlashcardSection } from '@/components/cuemath/CueFlashcardSection';
import { StreakBanner } from '@/components/ui/BadgeDisplay';
import type { UserStreakPayload } from '@/lib/streaks';
import { SlideCtaLink } from '@/components/ui/SlideCtaButton';
import { useAuth } from '@/hooks/useAuth';
import { HeroSection } from '@/components/cuemath/HeroSection';
import { FeaturesSection } from '@/components/cuemath/FeaturesSection';
import { FaqSection } from '@/components/cuemath/FaqSection';
  {
function HomeInner() {
  const { user, loading: authLoading } = useAuth();
  const [streakData, setStreakData] = useState<UserStreakPayload | null>(null);

  const isLoggedIn = !!user?.onboarded;

  const openLogin = () => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }));
  const openSignup = () => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signup' }));

  // fetch streak data when user changes
  useEffect(() => {
    if (user) {
      fetch('/api/me/streak', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => { if (d.streak) setStreakData(d.streak); })
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <HeroSection isLoggedIn={isLoggedIn} user={user} openLogin={openLogin} openSignup={openSignup} />

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

      <FeaturesSection />
      
      <FaqSection isLoggedIn={isLoggedIn} openLogin={openLogin} openSignup={openSignup} />
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
