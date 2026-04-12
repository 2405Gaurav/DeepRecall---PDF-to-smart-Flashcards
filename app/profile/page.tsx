import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth-session';
import { ProfileClientBento } from '@/components/profile/ProfileClientBento';

export const metadata: Metadata = {
  title: 'Your profile',
  description: 'See your learning analytics and account details.',
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user?.onboardingCompletedAt) {
    redirect('/?studio=login');
  }

  return (
    <ProfileClientBento
      displayName={user.displayName ?? ''}
      childName={user.childName}
      grade={user.grade}
      username={user.username ?? undefined}
    />
  );
}
