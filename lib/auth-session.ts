import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { CUE_SESSION_COOKIE, parseSessionUserId } from '@/lib/session-cookie';

export type SessionUser = {
  id: string;
  displayName: string | null;
  childName: string | null;
  grade: string | null;
  onboardingCompletedAt: Date | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const id = parseSessionUserId(store.get(CUE_SESSION_COOKIE)?.value);
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      childName: true,
      grade: true,
      onboardingCompletedAt: true,
    },
  });

  return user;
}
