import { motion } from 'framer-motion';
import { SlideCtaButton, SlideCtaLink } from '@/components/ui/SlideCtaButton';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { User } from 'lucide-react';
import Link from 'next/link';
import type { AuthUser } from '@/hooks/useAuth';

type HeroSectionProps = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  openLogin: () => void;
  openSignup: () => void;
};

export function HeroSection({ isLoggedIn, user, openLogin, openSignup }: HeroSectionProps) {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-6 pt-10 sm:px-6 sm:pt-12 md:pt-14">
      <FloatingParticles />

      <motion.div
        className="mx-auto mb-4 flex justify-center"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
      >
        <motion.span
          className="text-5xl select-none"
          animate={{ y: [0, -8] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'mirror', type: 'tween', ease: 'easeInOut' }}
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
        Cuemath · DeepRecall Learning Lab
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
  );
}
