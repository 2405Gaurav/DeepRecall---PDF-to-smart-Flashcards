import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE, cookieOptions } from '@/lib/jwt';

export const runtime = 'nodejs';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * POST /api/auth/signup
 * Body: { username, password }
 * Creates a new user with hashed password, sets JWT cookie.
 * New users still need onboarding (displayName, grade, etc).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';

    // validate username
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3–20 characters (letters, numbers, underscore only).' },
        { status: 400 }
      );
    }

    // validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // check if username already taken
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: 'This username is already taken. Try another one.' },
        { status: 409 }
      );
    }

    // hash password with cost factor 12
    const passwordHash = await bcrypt.hash(password, 12);

    // create user — onboarding not completed yet
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });

    // sign JWT
    const token = signToken({ userId: user.id, username });
    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        onboarded: false,
      },
    });

    res.cookies.set(AUTH_COOKIE, token, cookieOptions(process.env.NODE_ENV === 'production'));
    return res;
  } catch (error) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
