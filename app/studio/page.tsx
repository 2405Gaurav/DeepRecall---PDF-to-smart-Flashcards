import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth-session';
import { StudioClient } from '@/components/studio/StudioClient';

export const metadata: Metadata = {
  title: 'Your studio',
  description: 'Create PDF flashcards and explore your learning analytics.',
};

export default async function StudioPage() {
  const user = await getSessionUser();
  if (!user?.onboardingCompletedAt) {
    redirect('/?studio=login');
  }

  const displayName = user.displayName?.split(' ')[0] ?? 'Learner';

  return <StudioClient displayName={displayName} />;
}
