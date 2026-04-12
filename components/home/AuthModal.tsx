'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, UserRound, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const GRADES = ['KG', '1', '2', '3', '4', '5', '6', '7', '8'] as const;

type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
};

type AuthStep = 'credentials' | 'onboarding';

export function AuthModal({ open, onOpenChange, defaultMode = 'signup' }: AuthModalProps) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [step, setStep] = useState<AuthStep>('credentials');

  // credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // onboarding profile
  const [displayName, setDisplayName] = useState('');
  const [childName, setChildName] = useState('');
  const [grade, setGrade] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // track the username after signup so we can greet them in onboarding
  const [signedUpUsername, setSignedUpUsername] = useState('');

  useEffect(() => {
    if (open) {
      setStep('credentials');
      setError(null);
      setLoading(false);
    }
  }, [open, mode]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const cleanUsername = username.trim().toLowerCase();
  const canSubmitCreds = cleanUsername.length >= 3 && password.length >= 6;

  // signup or login
  const handleCredentials = async () => {
    if (!canSubmitCreds) return;
    setLoading(true);
    setError(null);

    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: cleanUsername, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      if (mode === 'signup') {
        // new user — go to onboarding step
        setSignedUpUsername(cleanUsername);
        setStep('onboarding');
      } else {
        // login — refresh auth, close modal, redirect
        await refresh();
        onOpenChange(false);
        if (data.user?.onboarded) {
          router.push('/studio');
        } else {
          // returning user who never finished onboarding
          setSignedUpUsername(cleanUsername);
          setStep('onboarding');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // complete onboarding
  const handleOnboarding = async () => {
    if (displayName.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName: displayName.trim(),
          childName: childName.trim() || undefined,
          grade: grade || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      await refresh();
      onOpenChange(false);
      router.push('/studio');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (v: boolean) => onOpenChange(v);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        hideCloseButton
        className="max-w-[440px] w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl border-2 border-lab-teal/50 p-0 shadow-2xl sm:rounded-2xl"
      >
        <DialogTitle className="sr-only">
          {mode === 'login' ? 'Log in to Cuemath' : 'Sign up for Cuemath'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {mode === 'login'
            ? 'Enter your username and password to access your account.'
            : 'Create a new account with a username and password.'}
        </DialogDescription>

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
              DEEPRECALL <span className="text-white/50">by Cuemath</span>
            </span>
            <UserRound className="h-5 w-5 text-white/95" aria-hidden />
          </div>
        </div>

        {/* Mode tabs — only show on credentials step */}
        {step === 'credentials' && (
          <div className="flex border-b border-lab-line">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
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
              onClick={() => { setMode('signup'); setError(null); }}
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
        )}

        <div className="bg-white px-6 pb-8 pt-6">
          <AnimatePresence mode="wait">
            {/* ── Credentials Step ── */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
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
                  {mode === 'login' ? '👋' : '✨'}
                </motion.div>
                <h2 className="text-center font-display text-xl font-semibold text-lab-teal-dark">
                  {mode === 'login' ? 'Welcome back!' : "Let's get started!"}
                </h2>
                <p className="mt-2 text-center text-sm text-lab-soft">
                  {mode === 'login'
                    ? 'Enter your username and password to continue'
                    : 'Choose a username and password to create your account'}
                </p>

                {/* test credentials for team */}
                {mode === 'login' && (
                  <div className="mt-4 rounded-xl border-2 border-dashed border-lab-teal/30 bg-lab-mint/40 px-4 py-3 text-center">
                    <p className="text-xs font-bold text-lab-teal-dark">👋 Welcome Team Cuemath!</p>
                    <p className="mt-1 text-[11px] text-lab-soft">
                      Test credentials: <strong className="text-lab-ink">test123</strong> / <strong className="text-lab-ink">pass123</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setUsername('test123'); setPassword('pass123'); }}
                      className="mt-2 rounded-full bg-lab-teal/10 px-3 py-1 text-[11px] font-bold text-lab-teal hover:bg-lab-teal/20 transition"
                    >
                      Auto-fill ✨
                    </button>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-lab-soft">Username</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                      placeholder="e.g. alex_2024"
                      className="h-12 rounded-lg border-2 border-neutral-800 bg-white text-base"
                      autoFocus
                      autoComplete="username"
                    />
                    {mode === 'signup' && username.length > 0 && username.length < 3 && (
                      <p className="text-[11px] text-amber-600">At least 3 characters</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-lab-soft">Password</label>
                    <div className="relative">
                      <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPwd ? 'text' : 'password'}
                        placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••'}
                        className="h-12 rounded-lg border-2 border-neutral-800 bg-white pr-10 text-base"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        onKeyDown={(e) => e.key === 'Enter' && canSubmitCreds && handleCredentials()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lab-soft hover:text-lab-ink"
                        tabIndex={-1}
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canSubmitCreds || loading}
                  onClick={handleCredentials}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition',
                    canSubmitCreds && !loading
                      ? 'bg-lab-amber text-lab-ink shadow hover:brightness-95'
                      : 'cursor-not-allowed bg-neutral-300 text-white'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {mode === 'signup' ? 'Creating…' : 'Logging in…'}
                    </>
                  ) : mode === 'signup' ? (
                    '🚀 Create Account'
                  ) : (
                    '✅ Log In'
                  )}
                </button>
              </motion.div>
            )}

            {/* ── Onboarding Step (after signup) ── */}
            {step === 'onboarding' && (
              <motion.div
                key="onboarding"
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
                  Hey {signedUpUsername}, let&apos;s set up your profile
                </h2>
                <p className="mt-1 text-center text-sm text-lab-soft">
                  This helps us personalize your learning experience
                </p>

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

                <button
                  type="button"
                  disabled={displayName.trim().length < 2 || loading}
                  onClick={handleOnboarding}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition',
                    displayName.trim().length >= 2 && !loading
                      ? 'bg-lab-amber text-lab-ink shadow hover:brightness-95'
                      : 'cursor-not-allowed bg-neutral-300 text-white'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    '🎉 Start Learning'
                  )}
                </button>
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
