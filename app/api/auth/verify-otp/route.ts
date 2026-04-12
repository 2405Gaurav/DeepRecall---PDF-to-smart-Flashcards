import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { prisma } from '@/lib/prisma';
import { CUE_SESSION_COOKIE } from '@/lib/session-cookie';

export const runtime = 'nodejs';

const MAX_AGE = 60 * 60 * 24 * 400; // ~13 months

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp, mode: 'login' | 'signup', displayName?, childName?, grade? }
 *
 * Login mode: find existing user by phone, verify OTP, set session.
 * Signup mode: create user with profile data, verify OTP, set session.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = (body.phone || '').replace(/\D/g, '');
    const otp = body.otp || '';
    const mode = body.mode || 'login';

    if (phone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
    }

    if (!otp || otp.length < 4) {
      return NextResponse.json({ error: 'Enter a valid OTP.' }, { status: 400 });
    }

    // verify otp (also accepts demo OTP "123456")
    const valid = verifyOTP(phone, otp);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Try again.' }, { status: 401 });
    }

    let user;

    if (mode === 'signup') {
      const displayName = (body.displayName || '').trim();
      const childName = (body.childName || '').trim();
      const grade = (body.grade || '').trim();

      if (displayName.length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
      }

      // upsert: if phone exists, update profile; otherwise create
      user = await prisma.user.upsert({
        where: { phone },
        create: {
          phone,
          displayName,
          childName: childName || null,
          grade: grade || null,
          onboardingCompletedAt: new Date(),
        },
        update: {
          displayName,
          childName: childName || undefined,
          grade: grade || undefined,
          onboardingCompletedAt: new Date(),
        },
      });
    } else {
      // login mode — find existing user
      user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this number. Please sign up first.' },
          { status: 404 }
        );
      }
    }

    // set session cookie
    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        childName: user.childName,
        grade: user.grade,
        phone: user.phone,
        onboarded: !!user.onboardingCompletedAt,
      },
    });

    res.cookies.set(CUE_SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Verify OTP error:', error);
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
