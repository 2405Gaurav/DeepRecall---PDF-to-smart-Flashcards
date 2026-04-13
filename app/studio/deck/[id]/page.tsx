import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth-session';
import { StudioDeckClient } from '@/components/studio/StudioDeckClient';
import { CueMathLoader } from '@/components/ui/CueMathLoader';

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
      {/* Suspense needed because StudioDeckClient reads useSearchParams */}
      <Suspense fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <CueMathLoader message="Loading deck…" />
        </div>
      }>
        <StudioDeckClient deckId={id} />
      </Suspense>
    </div>
  );
}
