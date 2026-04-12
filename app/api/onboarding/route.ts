import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CUE_SESSION_COOKIE } from '@/lib/session-cookie';

export const runtime = 'nodejs';

const MAX_AGE = 60 * 60 * 24 * 400;

const bodySchema = z.object({
  grade: z.string().min(1).max(8),
  displayName: z.string().trim().min(2).max(120),
  childName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ''))
    .refine((d) => d.length >= 10, 'Enter a valid phone number (at least 10 digits).'),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 500 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Invalid input', details: msg }, { status: 400 });
    }

    const { grade, displayName, childName, phone } = parsed.data;
    const now = new Date();

    const user = await prisma.user.upsert({
      where: { phone },
      create: {
        phone,
        displayName,
        childName,
        grade,
        onboardingCompletedAt: now,
      },
      update: {
        displayName,
        childName,
        grade,
        onboardingCompletedAt: now,
      },
    });

    const res = NextResponse.json({ ok: true, userId: user.id });
    res.cookies.set(CUE_SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
      path: '/',
    });
    return res;
  } catch (error) {
    console.error('Onboarding error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Optional: clear session (e.g. sign out later) */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUE_SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
