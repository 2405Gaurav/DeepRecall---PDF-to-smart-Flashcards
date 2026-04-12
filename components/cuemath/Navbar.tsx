'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlideCtaButton } from '@/components/ui/SlideCtaButton';

const MotionLink = motion(Link);

const MARKETING_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '/studio', label: 'Studio' },
  { href: '#faq', label: 'Resources' },
  { href: '#about-service', label: 'About' },
] as const;

const STUDIO_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/studio', label: 'Studio' },
  { href: '/profile', label: 'Profile' },
  { href: '/#faq', label: 'FAQ' },
] as const;

const navSpring = { type: 'spring' as const, stiffness: 420, damping: 28 };

type NavbarProps = {
  /** Omit on server-rendered pages; optional on client (studio uses no-op). */
  onGetStarted?: () => void;
  variant?: 'marketing' | 'studio';
};

export function Navbar({ onGetStarted = () => {}, variant = 'marketing' }: NavbarProps) {
  const pathname = usePathname();
  const isStudioRoute =
    variant === 'studio' ||
    pathname === '/studio' ||
    pathname === '/profile' ||
    (pathname?.startsWith('/studio/') ?? false);
  const links = isStudioRoute ? STUDIO_LINKS : MARKETING_LINKS;

  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-lab-line/80 bg-white/90 backdrop-blur-md"
      initial={false}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[3.5rem] sm:px-6">
        <MotionLink
          href="/"
          className="font-display text-lg font-bold tracking-tight text-lab-teal-dark sm:text-xl md:text-2xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={navSpring}
        >
          CUEMATH
        </MotionLink>

        <nav className="hidden items-center gap-1 md:flex md:gap-2">
          {links.map((l) => (
            <MotionLink
              key={l.href + l.label}
              href={l.href}
              className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-lab-soft transition-colors hover:text-lab-teal-dark"
              whileHover={{ y: -1 }}
              transition={navSpring}
            >
              {l.label}
            </MotionLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isStudioRoute && (
            <MotionLink
              href="/studio"
              className="hidden rounded-lg border-2 border-lab-teal px-3 py-2 text-sm font-bold leading-none text-lab-teal transition-colors hover:bg-lab-teal hover:text-white md:inline-block"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={navSpring}
            >
              Studio
            </MotionLink>
          )}
          {isStudioRoute ? (
            <MotionLink
              href="/"
              className="rounded-lg border-2 border-lab-teal bg-white px-3 py-2 text-sm font-bold leading-none text-lab-teal shadow-sm transition-colors hover:bg-lab-teal hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={navSpring}
            >
              Home
            </MotionLink>
          ) : (
            <>
              <SlideCtaButton onClick={onGetStarted} size="compact" className="md:hidden">
                Start
              </SlideCtaButton>
              <SlideCtaButton onClick={onGetStarted} size="compact" className="hidden md:inline-flex">
                Get started
              </SlideCtaButton>
            </>
          )}
        </div>
      </div>
      <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-lab-line/60 px-4 py-2 md:hidden">
        {links.map((l) => (
          <MotionLink
            key={l.href + l.label}
            href={l.href}
            className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-lab-soft active:text-lab-teal-dark"
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {l.label}
          </MotionLink>
        ))}
      </nav>
    </motion.header>
  );
}
