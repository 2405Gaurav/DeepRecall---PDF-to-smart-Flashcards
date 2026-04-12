'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/home/AuthModal';
import { useState, useEffect } from 'react';

// pages where we suppress the full chrome
const NO_CHROME = ['/studio/practice/'];
// pages that still get Navbar but no Footer (e.g. auth flows)

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const hideChrome = NO_CHROME.some((r) => pathname?.startsWith(r));

  // allow any child to open the auth modal via custom event
  useEffect(() => {
    const handler = (e: CustomEvent<'login' | 'signup'>) => {
      setAuthMode(e.detail);
      setAuthOpen(true);
    };
    window.addEventListener('open-auth', handler as EventListener);
    return () => window.removeEventListener('open-auth', handler as EventListener);
  }, []);

  if (hideChrome) return <>{children}</>;

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
