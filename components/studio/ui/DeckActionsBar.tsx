'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeckActionsBarProps {
  deckId: string;
  totalCards: number;
  showMoreCount?: number;
  canShowMore: boolean;
  onShowMore: () => void;
  showAnswersToggle: React.ReactNode;
  /** When true, the Start practice btn is disabled (deck still generating) */
  generating?: boolean;
}

/** Action bar: practice CTA + show-answers toggle + load-more button. */
export function DeckActionsBar({
  deckId,
  totalCards,
  canShowMore,
  showMoreCount = 0,
  onShowMore,
  showAnswersToggle,
  generating = false,
}: DeckActionsBarProps) {
  return (
    <>
      {/* Primary actions row */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <motion.p
          className="text-sm font-semibold text-lab-ink"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'tween' }}
        >
          {generating
            ? 'Cards are being created…'
            : `${totalCards} flashcard${totalCards !== 1 ? 's' : ''} created ✨`}
        </motion.p>
        <motion.div whileHover={generating ? {} : { scale: 1.04, y: -2 }} whileTap={generating ? {} : { scale: 0.97 }}>
          {generating ? (
            <Button
              size="lg"
              disabled
              className="rounded-xl bg-lab-teal/50 font-bold text-white shadow-md cursor-not-allowed"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-lab-teal font-bold text-white shadow-md transition hover:bg-lab-teal-dark"
            >
              <Link href={`/studio/practice/${deckId}`} className="inline-flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                🎯 Start practice
              </Link>
            </Button>
          )}
        </motion.div>
        {showAnswersToggle}
      </div>

      <p className="mx-auto mt-3 max-w-md text-center text-[11px] leading-relaxed text-lab-soft">
        After each card, how well you knew it updates when it comes back — easier cards wait longer; tricky ones return sooner.
      </p>

      {/* Load more */}
      {canShowMore && (
        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onShowMore}
            className="rounded-xl border-2 border-lab-teal/40 bg-white/90 font-bold text-lab-teal shadow-sm transition hover:border-lab-teal hover:bg-lab-mint/40"
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Show more ({showMoreCount} more)
          </Button>
        </div>
      )}
    </>
  );
}
