/** Client-safe shapes matching Prisma JSON API responses */

export type FlashcardDifficulty = 'NONE' | 'EASY' | 'HARD';

export interface ReviewFlashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
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
  totalCards: number;
  dueCards: number;
  masteredCards: number;
  inProgressCards: number;
}

export interface DeckDetailStats {
  totalCards: number;
  dueCards: number;
  masteredCards: number;
  inProgressCards: number;
}
