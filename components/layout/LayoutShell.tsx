'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/cuemath/Navbar';
import { Footer } from '@/components/cuemath/Footer';
import { AuthModal } from '@/components/cuemath/AuthModal';
import { useState, useEffect } from 'react';

// practice page gets no chrome at all
const NO_CHROME_ROUTES = ['/studio/practice/'];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // hide navbar/footer entirely on practice pages
  const hideChrome = NO_CHROME_ROUTES.some((r) => pathname?.startsWith(r));

  if (hideChrome) return <>{children}</>;

  useEffect(() => {
    const handler = (e: CustomEvent<'login' | 'signup'>) => {
      setAuthMode(e.detail);
      setAuthOpen(true);
    };
    window.addEventListener('open-auth', handler as EventListener);
    return () => window.removeEventListener('open-auth', handler as EventListener);
  }, []);

  const openLogin = () => { setAuthMode('login'); setAuthOpen(true); };
  const openSignup = () => { setAuthMode('signup'); setAuthOpen(true); };

  return (
    <>
      <Navbar onGetStarted={openSignup} onLogin={openLogin} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
      {children}
      <Footer />
    </>
  );
}
