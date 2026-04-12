import type { Metadata } from 'next';
import { CuemathHomeShell } from '@/components/home/CuemathHomeShell';

export const metadata: Metadata = {
  title: 'DeepRecall — PDF to Smart Flashcards',
  description:
    'Turn PDFs into teacher-quality flashcards, practice with spaced scheduling for long-term retention, and track mastery across all your decks.',
};

export default function Home() {
  return <CuemathHomeShell />;
}
