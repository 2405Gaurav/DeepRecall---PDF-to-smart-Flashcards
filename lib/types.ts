/** Client-safe shapes matching Prisma JSON API responses */

export type FlashcardDifficulty = 'NONE' | 'EASY' | 'HARD';

export type MasteryLevel = 'NEW' | 'LEARNING' | 'FAMILIAR' | 'MASTERED';

export interface ReviewFlashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  /** From API after migration; optional for legacy callers */
  masteryLevel?: MasteryLevel;
  interval: number;
  nextReview: string;
  lastReviewed: string | null;
  deckId: string;
  createdAt: string;
  cardType?: string;
}

export interface DeckListItem {
  id: string;
  title: string;
  createdAt: string;
  /** ISO date of most recent card review in this deck */
  lastReviewedAt: string | null;
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  familiarCards: number;
  masteredCards: number;
  inProgressCards: number;
}

export interface DeckDetailStats {
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  familiarCards: number;
  masteredCards: number;
  masteredPct: number;
}

export interface DeckCardRow {
  id: string;
  question: string;
  answer: string;
  masteryLevel: MasteryLevel;
  cardType?: string;
}
