'use client';

import { useState } from 'react';
import { Eye, Layers, Library } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { CardCountPreset } from '@/lib/gemini';

const OPTIONS: {
  id: CardCountPreset;
  title: string;
  hint: string;
  Icon: typeof Eye;
}[] = [
  {
    id: 'few',
    title: 'Light deck (~6–12)',
    hint: 'Best when you want sharp recall on the biggest ideas — still teacher-quality, not filler.',
    Icon: Eye,
  },
  {
    id: 'normal',
    title: 'Balanced (~15–28)',
    hint: 'Definitions, links between ideas, and examples across the chapter — our default for retention.',
    Icon: Layers,
  },
  {
    id: 'many',
    title: 'Deep pass (~30–50)',
    hint: 'More edge cases and worked-style prompts when the PDF is rich; depth over trivia.',
    Icon: Library,
  },
];

type CreateFlashcardsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  onConfirm: (preset: CardCountPreset) => void;
};

export function CreateFlashcardsModal({
  open,
  onOpenChange,
  fileName,
  onConfirm,
}: CreateFlashcardsModalProps) {
  const [preset, setPreset] = useState<CardCountPreset>('normal');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-lab-line/80 sm:max-w-lg">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lab-teal text-white shadow-sm">
              <Layers className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-lab-ink">Create flashcards</DialogTitle>
              <DialogDescription className="text-sm text-lab-soft">
                From <span className="font-medium text-lab-ink">{fileName}</span>. Choose coverage — AI favors{' '}
                <span className="font-medium text-lab-teal-dark">recall-heavy</span> cards for long-term memory, not
                shallow lists.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {OPTIONS.map(({ id, title, hint, Icon }) => {
            const selected = preset === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPreset(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-colors',
                  selected
                    ? 'border-lab-teal bg-lab-mint/50'
                    : 'border-lab-line/60 bg-white hover:border-lab-teal/40'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    selected ? 'bg-lab-teal text-white' : 'bg-lab-mint/40 text-lab-teal-dark'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-lab-ink">{title}</p>
                  <p className="text-xs text-lab-soft">{hint}</p>
                </div>
                {selected && (
                  <span className="text-lab-teal" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onConfirm(preset)}
          className="mt-2 w-full rounded-xl bg-lab-teal py-3 text-sm font-bold text-white shadow-sm transition hover:bg-lab-teal-dark"
        >
          Create flashcards
        </button>
      </DialogContent>
    </Dialog>
  );
}
