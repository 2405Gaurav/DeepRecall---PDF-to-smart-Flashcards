import type { Metadata } from 'next';
import { CuemathHomeShell } from '@/components/cuemath/CuemathHomeShell';

export const metadata: Metadata = {
  title: 'Cuemath Flashcards — PDF to MathFit™ decks',
  description:
    'Cuemath-style flashcard studio: upload PDFs, generate AI flashcards, and review with spaced repetition.',
};

export default function Home() {
  return <CuemathHomeShell />;
}
