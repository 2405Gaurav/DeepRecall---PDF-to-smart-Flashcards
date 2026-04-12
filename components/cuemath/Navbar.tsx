'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { SlideCtaButton } from '@/components/ui/SlideCtaButton';
import { cn } from '@/lib/utils';

const MotionLink = motion(Link);

const MARKETING_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#about-service', label: 'About' },
  { href: '#faq', label: 'FAQ' },
] as const;

const LOGGED_IN_LINKS = [
  { href: '/studio', label: 'Studio' },
  { href: '/profile', label: 'Profile' },
] as const;

/** Studio / profile / practice: show minimal nav inside app */
const STUDIO_APP_LINKS = [{ href: '/profile', label: 'Profile' }] as const;

const navSpring = { type: 'spring' as const, stiffness: 420, damping: 28 };

type NavbarProps = {
  onGetStarted?: () => void;
  onLogin?: () => void;
  variant?: 'marketing' | 'studio';
  isLoggedIn?: boolean;
  userName?: string | null;
  onLogout?: () => void;
};

export function Navbar({
  onGetStarted = () => {},
  onLogin = () => {},
  variant = 'marketing',
  isLoggedIn = false,
  userName,
  onLogout,
}: NavbarProps) {
  const pathname = usePathname();
  const isStudioRoute =
    variant === 'studio' ||
    pathname === '/studio' ||
    pathname === '/profile' ||
    (pathname?.startsWith('/studio/') ?? false);

  // choose which links to show
  const links = isStudioRoute
    ? STUDIO_APP_LINKS
    : isLoggedIn
      ? [...MARKETING_LINKS, ...LOGGED_IN_LINKS]
      : MARKETING_LINKS;

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
              className={cnNavLink(pathname, l.href)}
              whileHover={{ y: -1 }}
              transition={navSpring}
            >
              {l.label}
            </MotionLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            /* logged-in state: show name, studio link, logout */
            <>
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
              {isStudioRoute && (
                <MotionLink
                  href="/"
                  className="rounded-lg border-2 border-lab-teal bg-white px-3 py-2 text-sm font-bold leading-none text-lab-teal shadow-sm transition-colors hover:bg-lab-teal hover:text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={navSpring}
                >
                  Home
                </MotionLink>
              )}
              <div className="hidden items-center gap-1.5 rounded-lg bg-lab-mint/50 px-3 py-1.5 md:flex">
                <User className="h-3.5 w-3.5 text-lab-teal" />
                <span className="text-xs font-semibold text-lab-teal-dark truncate max-w-[100px]">
                  {userName || 'User'}
                </span>
              </div>
              {onLogout && (
                <motion.button
                  onClick={onLogout}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-lab-soft transition hover:bg-red-50 hover:text-red-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="Log out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              )}
            </>
          ) : (
            /* logged-out state: show Login + Get Started */
            <>
              <motion.button
                onClick={onLogin}
                className="rounded-lg border-2 border-lab-teal px-3 py-2 text-sm font-bold leading-none text-lab-teal transition-colors hover:bg-lab-teal hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={navSpring}
              >
                Log In
              </motion.button>
              <SlideCtaButton onClick={onGetStarted} size="compact" className="md:hidden">
                Start
              </SlideCtaButton>
              <SlideCtaButton onClick={onGetStarted} size="compact" className="hidden md:inline-flex">
                Sign Up
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
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-semibold active:text-lab-teal-dark',
              pathname === l.href || (l.href === '/profile' && pathname === '/profile')
                ? 'text-lab-teal-dark'
                : 'text-lab-soft'
            )}
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

function cnNavLink(pathname: string | null, href: string) {
  const active = pathname === href || (href === '/profile' && pathname === '/profile');
  return cn(
    'rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors hover:text-lab-teal-dark',
    active ? 'text-lab-teal-dark' : 'text-lab-soft'
  );
}
