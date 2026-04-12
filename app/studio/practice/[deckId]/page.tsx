import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth-session';
import { PracticeSession } from '@/components/studio/PracticeSession';

export const metadata: Metadata = {
  title: 'Practice',
  description: 'Study flashcards with Learning, Familiar, and Mastered.',
};

export default async function StudioPracticePage({ params }: { params: Promise<{ deckId: string }> }) {
  const user = await getSessionUser();
  if (!user?.onboardingCompletedAt) {
    redirect('/?studio=login');
  }

  const { deckId } = await params;

  return <PracticeSession deckId={deckId} />;
}
