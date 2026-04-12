-- CreateEnum
CREATE TYPE "MasteryLevel" AS ENUM ('NEW', 'LEARNING', 'FAMILIAR', 'MASTERED');

-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN "mastery_level" "MasteryLevel" NOT NULL DEFAULT 'NEW';

CREATE INDEX "flashcards_deck_id_mastery_level_idx" ON "flashcards"("deck_id", "mastery_level");

-- AlterEnum (PostgreSQL: append new values)
ALTER TYPE "ReviewOutcome" ADD VALUE 'LEARNING';
ALTER TYPE "ReviewOutcome" ADD VALUE 'FAMILIAR';
ALTER TYPE "ReviewOutcome" ADD VALUE 'MASTERED';

-- Backfill mastery from legacy interval / difficulty
UPDATE "flashcards"
SET "mastery_level" = 'MASTERED'
WHERE "interval" > 7;

UPDATE "flashcards"
SET "mastery_level" = 'FAMILIAR'
WHERE "mastery_level" = 'NEW'
  AND "last_reviewed" IS NOT NULL
  AND "interval" <= 7
  AND "difficulty" = 'EASY';

UPDATE "flashcards"
SET "mastery_level" = 'LEARNING'
WHERE "mastery_level" = 'NEW'
  AND "last_reviewed" IS NOT NULL
  AND "interval" <= 7
  AND "difficulty" = 'HARD';
