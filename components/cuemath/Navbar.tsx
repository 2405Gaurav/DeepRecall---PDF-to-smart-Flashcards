'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SlideCtaButton } from '@/components/ui/SlideCtaButton';

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
    <header className="sticky top-0 z-40 border-b border-lab-line/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[3.5rem] sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-lab-teal-dark sm:text-xl md:text-2xl"
        >
          CUEMATH
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="text-sm font-semibold text-lab-soft transition-colors hover:text-lab-teal-dark"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isStudioRoute && (
            <Link
              href="/studio"
              className="hidden rounded-lg border-2 border-lab-teal px-3 py-2 text-sm font-bold leading-none text-lab-teal transition hover:bg-lab-teal hover:text-white md:inline-block"
            >
              Studio
            </Link>
          )}
          {isStudioRoute ? (
            <Link
              href="/"
              className="rounded-lg border-2 border-lab-teal bg-white px-3 py-2 text-sm font-bold leading-none text-lab-teal shadow-sm transition hover:bg-lab-teal hover:text-white"
            >
              Home
            </Link>
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
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-lab-line/60 px-4 py-2 md:hidden">
        {links.map((l) => (
          <Link key={l.href + l.label} href={l.href} className="text-xs font-semibold text-lab-soft">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
