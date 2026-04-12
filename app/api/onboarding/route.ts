import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';

export const runtime = 'nodejs';

const bodySchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  childName: z.string().trim().max(120).optional(),
  grade: z.string().min(1).max(8).optional(),
});

/**
 * POST /api/onboarding
 * Requires an authenticated user (JWT cookie set from signup/login).
 * Updates their profile details and marks onboarding complete.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = readSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated. Please sign up or log in first.' }, { status: 401 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Invalid input', details: msg }, { status: 400 });
    }

    const { displayName, childName, grade } = parsed.data;
    const now = new Date();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        childName: childName || null,
        grade: grade || null,
        onboardingCompletedAt: now,
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error('Onboarding error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
