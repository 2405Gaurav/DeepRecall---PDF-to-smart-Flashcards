'use client';

import { useState, useEffect } from 'react';
import { Rocket, UserRound, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const GRADES = ['KG', '1', '2', '3', '4', '5', '6', '7', '8'] as const;

const STEP_COPY = [
  {
    kicker: 'TAKE THE FIRST STEP TOWARDS EMPOWERING YOUR CHILD TO EXCEL AT SCHOOL AND BEYOND!',
    title: (
      <>
        Which <strong>grade</strong> is your child in?
      </>
    ),
  },
  {
    kicker: 'JOIN OUR COMMUNITY OF LEARNERS BUILDING DEEPRECALL HABITS!',
    title: (
      <>
        What&apos;s <strong>your name</strong>?
      </>
    ),
  },
  {
    kicker: 'EVERY CHILD IS UNIQUE, AND WE PERSONALIZE THE JOURNEY FOR YOUR CHILD!',
    title: (
      <>
        What&apos;s your <strong>child&apos;s name</strong>?
      </>
    ),
  },
  {
    kicker: 'MOBILE NUMBER — OTP WILL VERIFY THIS LATER (DUMMY ENTRY FOR NOW)',
    title: (
      <>
        What&apos;s your <strong>mobile number</strong>?
      </>
    ),
  },
] as const;

type OnboardingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [childName, setChildName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) setStep(0);
  };

  const canNext =
    step === 0
      ? !!grade
      : step === 1
        ? displayName.trim().length >= 2
        : step === 2
          ? childName.trim().length >= 2
          : phone.replace(/\D/g, '').length >= 10;

  const goNext = () => {
    if (!canNext) return;
    if (step < STEP_COPY.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    void submit();
  };

  const submit = async () => {
    if (!grade) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          grade,
          displayName: displayName.trim(),
          childName: childName.trim(),
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      handleOpenChange(false);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const copy = STEP_COPY[step];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        className="max-w-[440px] w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl border-2 border-lab-teal/50 p-0 shadow-2xl sm:rounded-2xl"
      >
        <DialogTitle className="sr-only">Get started with Cuemath Flashcards</DialogTitle>

        <div className="relative bg-lab-teal px-4 pt-3 pb-2 text-white">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="absolute right-3 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-lg font-light text-lab-teal shadow hover:bg-white"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex items-center justify-between pr-10">
            <Rocket className="h-5 w-5 text-white/95" aria-hidden />
            <span className="font-display text-[10px] font-bold tracking-widest text-white/90">
              CUEMATH · FLASHCARDS
            </span>
            <UserRound className="h-5 w-5 text-white/95" aria-hidden />
          </div>
          <div className="relative mt-2 h-1 rounded-full bg-lab-coral/90">
            <span
              className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ left: `${(step / (STEP_COPY.length - 1)) * 88}%` }}
            />
          </div>
        </div>

        <div className="bg-white px-6 pb-8 pt-6">
          <p className="text-center text-[10px] font-medium leading-relaxed tracking-wide text-lab-soft">
            {copy.kicker}
          </p>
          <h2 className="mt-4 text-center font-display text-xl font-semibold leading-snug text-lab-teal-dark sm:text-2xl">
            {copy.title}
          </h2>

          <div className="mt-8">
            {step === 0 && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setGrade('KG')}
                  className={cn(
                    'w-full rounded-lg border-2 py-3 text-center text-sm font-bold transition',
                    grade === 'KG'
                      ? 'border-lab-teal bg-lab-mint'
                      : 'border-neutral-300 bg-white hover:border-lab-teal'
                  )}
                >
                  KG
                </button>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.filter((g) => g !== 'KG').map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={cn(
                        'rounded-lg border-2 py-3 text-sm font-bold transition',
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
            )}

            {step === 1 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-lab-soft">Your name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 rounded-lg border-2 border-neutral-800 bg-white text-base"
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-lab-soft">Your child&apos;s name</label>
                <Input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter your child's name"
                  className="h-12 rounded-lg border-2 border-neutral-800 bg-white text-base"
                  autoFocus
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-lab-soft">Mobile number (dummy for now)</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  inputMode="tel"
                  className="h-12 rounded-lg border-2 border-neutral-800 bg-white text-base"
                  autoFocus
                />
                <p className="text-xs text-lab-soft">
                  OTP verification will be wired here later. Any 10+ digit number is accepted for this demo.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-full border-2 border-neutral-300 px-5 py-3 text-sm font-semibold text-lab-teal-dark hover:bg-neutral-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              disabled={!canNext || loading}
              onClick={goNext}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition',
                canNext && !loading
                  ? 'bg-lab-amber text-lab-ink shadow hover:brightness-95'
                  : 'cursor-not-allowed bg-neutral-300 text-white'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : step === STEP_COPY.length - 1 ? (
                'Finish'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
