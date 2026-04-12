/**
 * OTP utility — generates and verifies time-based OTP codes.
 *
 * For the demo, we support a "dummy" mode:
 * - The universal demo OTP is "123456" — always works with any number
 * - In production, replace with SMS gateway (Twilio, MSG91, etc.)
 */

import { TOTP, generateSecret, generateSync, verifySync } from 'otplib';
import { DEMO_OTP } from '@/lib/demo-otp';

// In-memory OTP store (phone → secret) — in prod use Redis or DB
const otpStore = new Map<string, { secret: string; expiresAt: number }>();

/**
 * Generate an OTP for a phone number.
 * Returns the 6-digit code (in prod, you'd send it via SMS instead).
 */
export function generateOTP(phone: string): string {
  const secret = generateSecret();
  const token = generateSync({ secret, digits: 6 });

  // store it with 5-min expiry
  otpStore.set(phone, {
    secret,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return token;
}

/**
 * Verify the OTP for a phone number.
 * Also accepts the demo OTP "123456" for any number.
 */
export function verifyOTP(phone: string, code: string): boolean {
  // demo: universal OTP always works
  if (code === DEMO_OTP) return true;

  const stored = otpStore.get(phone);
  if (!stored) return false;

  // check expiry
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  const result = verifySync({ token: code, secret: stored.secret, digits: 6 });
  const valid = typeof result === 'boolean' ? result : result?.valid === true;
  if (valid) {
    otpStore.delete(phone); // one-time use
  }
  return valid;
}
