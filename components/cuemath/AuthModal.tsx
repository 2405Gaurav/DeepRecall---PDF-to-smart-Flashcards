'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, UserRound, Loader2, Phone, KeyRound, ArrowLeft, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_OTP } from '@/lib/demo-otp';

const GRADES = ['KG', '1', '2', '3', '4', '5', '6', '7', '8'] as const;

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
};

type AuthStep = 'phone' | 'otp' | 'profile';

export function AuthModal({ open, onOpenChange, defaultMode = 'signup' }: AuthModalProps) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [childName, setChildName] = useState('');
  const [grade, setGrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentOtp, setSentOtp] = useState<string | null>(null); // demo only — shows generated OTP

  // reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      setStep('phone');
      setOtp('');
      setError(null);
      setLoading(false);
      setSentOtp(null);
    }
  }, [open, mode]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const cleanedPhone = phone.replace(/\D/g, '');

  // Send OTP
  const handleSendOtp = async () => {
    if (cleanedPhone.length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setSentOtp(data.demoOtp || null);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError(null);

    // for signup, if profile not filled yet, go to profile step
    if (mode === 'signup' && step === 'otp') {
      setStep('profile');
      setLoading(false);
      return;
    }

    // login mode — verify and done
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: cleanedPhone,
          otp,
          mode,
          displayName: displayName.trim(),
          childName: childName.trim(),
          grade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      await refresh();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to verify');
    } finally {
      setLoading(false);
    }
  };

  // Signup final submit
  const handleSignupSubmit = async () => {
    if (displayName.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: cleanedPhone,
          otp,
          mode: 'signup',
          displayName: displayName.trim(),
          childName: childName.trim(),
          grade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      await refresh();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        hideCloseButton
        className="max-w-[440px] w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl border-2 border-lab-teal/50 p-0 shadow-2xl sm:rounded-2xl"
      >
        <DialogTitle className="sr-only">
          {mode === 'login' ? 'Log in to Cuemath' : 'Sign up for Cuemath'}
        </DialogTitle>

        {/* Header */}
        <div className="relative bg-lab-teal px-4 pt-3 pb-2 text-white">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="absolute right-3 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-lg font-light text-lab-teal shadow hover:bg-white"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex items-center justify-between pr-10">
            <Rocket className="h-5 w-5 text-white/95" aria-hidden />
            <span className="font-display text-[10px] font-bold tracking-widest text-white/90">
              CUEMATH · DEEPRECALL
            </span>
            <UserRound className="h-5 w-5 text-white/95" aria-hidden />
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-lab-line">
          <button
            type="button"
            onClick={() => { setMode('login'); setStep('phone'); setError(null); }}
            className={cn(
              'flex-1 py-3 text-sm font-bold transition',
              mode === 'login'
                ? 'border-b-2 border-lab-teal text-lab-teal-dark bg-lab-mint/30'
                : 'text-lab-soft hover:text-lab-teal-dark'
            )}
          >
            🔑 Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setStep('phone'); setError(null); }}
            className={cn(
              'flex-1 py-3 text-sm font-bold transition',
              mode === 'signup'
                ? 'border-b-2 border-lab-teal text-lab-teal-dark bg-lab-mint/30'
                : 'text-lab-soft hover:text-lab-teal-dark'
            )}
          >
            🚀 Sign Up
          </button>
        </div>

        <div className="bg-white px-6 pb-8 pt-6">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Phone ── */}
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="mx-auto mb-3 w-fit text-3xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📱
                </motion.div>
                <h2 className="text-center font-display text-xl font-semibold text-lab-teal-dark">
                  {mode === 'login' ? 'Welcome back! 👋' : 'Let\'s get started! ✨'}
                </h2>
                <p className="mt-2 text-center text-sm text-lab-soft">
                  Enter your mobile number to {mode === 'login' ? 'log in' : 'create an account'}
                </p>

                <div className="mt-6 space-y-2">
                  <label className="text-xs font-semibold text-lab-soft">Mobile number</label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-12 items-center rounded-lg border-2 border-neutral-300 bg-neutral-50 px-3 text-sm font-medium text-lab-soft">
                      +91
                    </span>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      inputMode="tel"
                      maxLength={15}
                      className="h-12 flex-1 rounded-lg border-2 border-neutral-800 bg-white text-base"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-lab-soft">
                    <Sparkles className="h-3 w-3 text-lab-amber" />
                    Demo OTP: <code className="rounded bg-lab-mint px-1.5 py-0.5 font-mono font-bold text-lab-teal">{DEMO_OTP}</code> works with any number
                  </p>
                </div>

                <button
                  type="button"
                  disabled={cleanedPhone.length < 10 || loading}
                  onClick={handleSendOtp}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition',
                    cleanedPhone.length >= 10 && !loading
                      ? 'bg-lab-amber text-lab-ink shadow hover:brightness-95'
                      : 'cursor-not-allowed bg-neutral-300 text-white'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" /> Send OTP
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* ── Step 2: OTP Verification ── */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(null); }}
                  className="mb-2 flex items-center gap-1 text-sm font-semibold text-lab-teal hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> Change number
                </button>

                <motion.div
                  className="mx-auto mb-3 w-fit text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🔐
                </motion.div>
                <h2 className="text-center font-display text-xl font-semibold text-lab-teal-dark">
                  Enter OTP
                </h2>
                <p className="mt-1 text-center text-sm text-lab-soft">
                  Sent to <strong>{phone}</strong>
                </p>

                {sentOtp && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-lab-mint bg-lab-mint/30 py-2 text-sm">
                    <KeyRound className="h-4 w-4 text-lab-teal" />
                    <span className="text-lab-soft">Demo OTP:</span>
                    <code className="font-mono font-bold text-lab-teal">{sentOtp}</code>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <label className="text-xs font-semibold text-lab-soft">6-digit OTP</label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    className="h-12 rounded-lg border-2 border-neutral-800 bg-white text-center text-xl font-mono tracking-[0.3em]"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  />
                </div>

                <button
                  type="button"
                  disabled={otp.length < 4 || loading}
                  onClick={handleVerifyOtp}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition',
                    otp.length >= 4 && !loading
                      ? 'bg-lab-amber text-lab-ink shadow hover:brightness-95'
                      : 'cursor-not-allowed bg-neutral-300 text-white'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                    </>
                  ) : mode === 'signup' ? (
                    'Verify & Continue →'
                  ) : (
                    '✅ Verify & Log In'
                  )}
                </button>
              </motion.div>
            )}

            {/* ── Step 3: Signup Profile ── */}
            {step === 'profile' && mode === 'signup' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="mx-auto mb-3 w-fit text-3xl"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  🎓
                </motion.div>
                <h2 className="text-center font-display text-xl font-semibold text-lab-teal-dark">
                  Tell us about yourself
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-lab-soft">Your name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your full name"
                      className="h-11 rounded-lg border-2 border-neutral-800 bg-white text-base"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-lab-soft">Child&apos;s name <span className="text-neutral-400">(optional)</span></label>
                    <Input
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Enter your child's name"
                      className="h-11 rounded-lg border-2 border-neutral-800 bg-white text-base"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-lab-soft">Grade</label>
                    <div className="grid grid-cols-5 gap-2">
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={cn(
                            'rounded-lg border-2 py-2 text-sm font-bold transition',
                            grade === g
                              ? 'border-lab-teal bg-lab-mint'
                              : 'border-neutral-300 bg-white hover:border-lab-teal'
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('otp')}
                    className="rounded-full border-2 border-neutral-300 px-5 py-3 text-sm font-semibold text-lab-teal-dark hover:bg-neutral-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={displayName.trim().length < 2 || loading}
                    onClick={handleSignupSubmit}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition',
                      displayName.trim().length >= 2 && !loading
                        ? 'bg-lab-amber text-lab-ink shadow hover:brightness-95'
                        : 'cursor-not-allowed bg-neutral-300 text-white'
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                      </>
                    ) : (
                      '🚀 Create Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              className="mt-4 text-center text-sm text-red-600"
              role="alert"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
