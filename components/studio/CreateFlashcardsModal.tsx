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
  { id: 'few', title: 'Create few ~10', hint: 'Key ideas only.', Icon: Eye },
  { id: 'normal', title: 'Create normal ~20–40', hint: 'Balanced deck.', Icon: Layers },
  { id: 'many', title: 'Create many ~50+', hint: 'More detail & examples.', Icon: Library },
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
      <DialogContent className="max-w-md rounded-2xl border-violet-100 sm:max-w-lg">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Layers className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900">Create flashcards</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                From <span className="font-medium text-zinc-700">{fileName}</span>. Pick how many cards to aim for.
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
                    ? 'border-violet-600 bg-violet-50/80'
                    : 'border-zinc-100 bg-white hover:border-violet-200'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    selected ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-900">{title}</p>
                  <p className="text-xs text-zinc-500">{hint}</p>
                </div>
                {selected && (
                  <span className="text-violet-600" aria-hidden>
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
          className="mt-2 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
        >
          Create flashcards
        </button>
      </DialogContent>
    </Dialog>
  );
}
