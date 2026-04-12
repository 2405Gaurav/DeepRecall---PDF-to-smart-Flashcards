import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, Outfit } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { LayoutShell } from '@/components/layout/LayoutShell';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DeepRecall — Smart Flashcards',
    template: '%s · DeepRecall',
  },
  description: 'PDF to flashcards — DeepRecall learning studio by Cuemath.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className={`${dmSans.className} font-cue antialiased`}>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
