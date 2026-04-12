import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '@/lib/otp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/send-otp
 * Body: { phone: string }
 * Generates an OTP for the phone number.
 * In demo mode the OTP is returned in response (in prod, send via SMS).
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const cleaned = (phone || '').replace(/\D/g, '');

    if (cleaned.length < 10) {
      return NextResponse.json(
        { error: 'Enter a valid phone number (at least 10 digits).' },
        { status: 400 }
      );
    }

    const otp = generateOTP(cleaned);

    // In prod: send via Twilio/MSG91. For demo, return in response.
    return NextResponse.json({
      ok: true,
      message: 'OTP sent successfully',
      // demo only — remove in prod:
      demoOtp: otp,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
