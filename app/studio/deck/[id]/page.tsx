import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth-session';
import { Navbar } from '@/components/cuemath/Navbar';
import { StudioDeckClient } from '@/components/studio/StudioDeckClient';

export const metadata: Metadata = {
  title: 'Deck',
  description: 'View progress and practice your flashcards.',
};

export default async function StudioDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user?.onboardingCompletedAt) {
    redirect('/?studio=login');
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-lab-grid font-cue text-lab-ink">
      <Navbar variant="studio" />
      <StudioDeckClient deckId={id} />
    </div>
  );
}
