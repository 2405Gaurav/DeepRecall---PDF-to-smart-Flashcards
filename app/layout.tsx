import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, Outfit } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';

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
    default: 'Cuemath Flashcards',
    template: '%s · Cuemath Flashcards',
  },
  description: 'PDF to flashcards — DeepRecall learning studio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className={`${dmSans.className} font-cue antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
