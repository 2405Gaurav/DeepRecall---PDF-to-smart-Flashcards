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
      {/* override default bg-background with our colourful card */}
      <DialogContent className="max-w-md rounded-2xl border-0 p-0 overflow-hidden shadow-2xl sm:max-w-lg">
        {/* joyful gradient header strip */}
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 pt-6 pb-5">
          <DialogHeader className="text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm backdrop-blur-sm">
                <Layers className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Create flashcards</DialogTitle>
                <DialogDescription className="text-sm text-indigo-100">
                  From <span className="font-medium text-white">{fileName}</span>. Choose coverage — AI favors{' '}
                  <span className="font-medium text-yellow-300">recall-heavy</span> cards for long-term memory, not
                  shallow lists.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* option cards on warm white */}
        <div className="bg-white px-6 pt-4 pb-6">
          <div className="space-y-2">
            {OPTIONS.map(({ id, title, hint, Icon }) => {
              const selected = preset === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPreset(id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all duration-150',
                    selected
                      ? 'border-violet-500 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                      selected
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-bold', selected ? 'text-violet-800' : 'text-slate-800')}>
                      {title}
                    </p>
                    <p className="text-xs text-slate-500">{hint}</p>
                  </div>
                  {selected && (
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white text-xs font-bold shadow"
                      aria-hidden
                    >
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
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-3 text-sm font-bold text-white shadow-md transition hover:from-indigo-600 hover:to-fuchsia-600 hover:shadow-lg active:scale-[0.98]"
          >
            ✨ Create flashcards
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
