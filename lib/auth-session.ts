import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AUTH_COOKIE, verifyToken } from '@/lib/jwt';

export type SessionUser = {
  id: string;
  username: string | null;
  displayName: string | null;
  childName: string | null;
  grade: string | null;
  phone: string | null;
  onboardingCompletedAt: Date | null;
};

/** Read the JWT from the cookie, verify it, and fetch the user from the DB. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      childName: true,
      grade: true,
      phone: true,
      onboardingCompletedAt: true,
    },
  });

  return user;
}
