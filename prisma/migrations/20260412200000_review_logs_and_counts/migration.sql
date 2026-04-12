-- CreateEnum
CREATE TYPE "ReviewOutcome" AS ENUM ('EASY', 'HARD');

-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN "easy_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flashcards" ADD COLUMN "hard_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "review_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "flashcard_id" UUID NOT NULL,
    "outcome" "ReviewOutcome" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_logs_user_id_created_at_idx" ON "review_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "review_logs_flashcard_id_idx" ON "review_logs"("flashcard_id");

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
