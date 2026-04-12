import type { Metadata } from 'next';
import { CuemathHomeShell } from '@/components/cuemath/CuemathHomeShell';

export const metadata: Metadata = {
  title: 'Cuemath Flashcards — PDF to DeepRecall decks',
  description:
    'Turn PDFs into teacher-quality flashcards, practice with spaced scheduling (long-term retention), and track mastery across all your decks.',
};

export default function Home() {
  return <CuemathHomeShell />;
}
