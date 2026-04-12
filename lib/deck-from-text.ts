import { prisma } from '@/lib/prisma';
import { generateFlashcards, normalizeCardType } from '@/lib/gemini';

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();
}

const now = () => new Date();

export async function createDeckFromExtractedText(
  deckTitle: string,
  rawText: string,
  opts?: { userId?: string | null }
) {
  const text = normalizeExtractedText(rawText);
  if (text.length < 100) {
    throw new Error(
      'Could not extract enough text from this PDF. Try a text-based PDF (not a scanned image), or a shorter excerpt may have failed extraction.'
    );
  }

  const rawFlashcards = await generateFlashcards(text);

  const title =
    deckTitle.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim() ||
    `Deck ${new Date().toLocaleDateString()}`;

  return prisma.$transaction(async (tx) => {
    const deck = await tx.deck.create({
      data: {
        title,
        ...(opts?.userId ? { userId: opts.userId } : {}),
      },
    });

    const due = now();

    await tx.flashcard.createMany({
      data: rawFlashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
        cardType: normalizeCardType(card.type),
        difficulty: 'NONE',
        interval: 1,
        nextReview: due,
        deckId: deck.id,
      })),
    });

    const flashcards = await tx.flashcard.findMany({
      where: { deckId: deck.id },
      orderBy: { createdAt: 'asc' },
    });

    return { deck, flashcards };
  });
}
