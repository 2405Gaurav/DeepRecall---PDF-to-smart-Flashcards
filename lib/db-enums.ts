/**
 * Runtime-safe enum string literals. Use when @prisma/client enums are missing
 * (e.g. prisma generate not run yet) — queries still work with these values.
 */
export const ML = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  FAMILIAR: 'FAMILIAR',
  MASTERED: 'MASTERED',
} as const;

export const RO = {
  EASY: 'EASY',
  HARD: 'HARD',
  LEARNING: 'LEARNING',
  FAMILIAR: 'FAMILIAR',
  MASTERED: 'MASTERED',
} as const;

export const DS = {
  GENERATING: 'GENERATING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export type MasteryLevelLiteral = (typeof ML)[keyof typeof ML];
export type ReviewOutcomeLiteral = (typeof RO)[keyof typeof RO];
export type DeckStatusLiteral = (typeof DS)[keyof typeof DS];
