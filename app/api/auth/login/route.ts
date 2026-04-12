import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE, cookieOptions } from '@/lib/jwt';

export const runtime = 'nodejs';

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Verifies credentials, sets JWT cookie.
 * Returns user info including onboarded status so client knows
 * whether to redirect to onboarding or studio.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // find user by username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // compare password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // sign JWT
    const token = signToken({ userId: user.id, username });
    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        onboarded: !!user.onboardingCompletedAt,
      },
    });

    res.cookies.set(AUTH_COOKIE, token, cookieOptions(process.env.NODE_ENV === 'production'));
    return res;
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
