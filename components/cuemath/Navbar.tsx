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
  { href: '/#faq', label: 'FAQ' },
] as const;

type NavbarProps = {
  onGetStarted: () => void;
  variant?: 'marketing' | 'studio';
};

export function Navbar({ onGetStarted, variant = 'marketing' }: NavbarProps) {
  const pathname = usePathname();
  const isStudio = variant === 'studio' || pathname === '/studio';
  const links = isStudio ? STUDIO_LINKS : MARKETING_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-lab-line/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-lab-teal-dark sm:text-2xl md:text-3xl"
        >
          CUEMATH
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="text-sm font-semibold text-lab-soft transition-colors hover:text-lab-teal-dark md:text-base"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isStudio && (
            <Link
              href="/studio"
              className="hidden rounded-lg border-2 border-lab-teal px-3 py-2 text-sm font-bold text-lab-teal transition hover:bg-lab-teal hover:text-white md:inline-block"
            >
              Studio
            </Link>
          )}
          {isStudio ? (
            <Link
              href="/"
              className="rounded-lg border-2 border-lab-teal bg-white px-4 py-2.5 text-sm font-bold text-lab-teal shadow-sm transition hover:bg-lab-teal hover:text-white sm:px-5 sm:text-base"
            >
              Home
            </Link>
          ) : (
            <>
              <SlideCtaButton onClick={onGetStarted} className="md:hidden">
                Start
              </SlideCtaButton>
              <SlideCtaButton onClick={onGetStarted} className="hidden md:inline-flex">
                Get started
              </SlideCtaButton>
            </>
          )}
        </div>
      </div>
      <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 border-t border-lab-line/60 px-4 py-2.5 md:hidden">
        {links.map((l) => (
          <Link key={l.href + l.label} href={l.href} className="text-xs font-semibold text-lab-soft">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
