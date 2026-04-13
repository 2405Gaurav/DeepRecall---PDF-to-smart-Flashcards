import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';
import { generateFlashcards, normalizeCardType, type CardCountPreset } from '@/lib/gemini';
import { DS } from '@/lib/db-enums';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * Phase 2 — runs in the background after the HTTP response is sent.
 * Generates flashcards with CuemathsAI and saves them to the deck.
 */
async function generateAndSaveCards(
  deckId: string,
  text: string,
  cardPreset: CardCountPreset
): Promise<void> {
  try {
    const rawCards = await generateFlashcards(text, cardPreset);

    await prisma.$transaction(async (tx) => {
      await tx.flashcard.createMany({
        data: rawCards.map((card) => ({
          question: card.question,
          answer: card.answer,
          cardType: normalizeCardType(card.type),
          difficulty: 'NONE',
          interval: 1,
          nextReview: new Date(),
          deckId,
        })),
      });
      await tx.deck.update({
        where: { id: deckId },
        data: { status: DS.READY },
      });
    });

    console.log(`[upload] Deck ${deckId} — READY with ${rawCards.length} cards`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[upload] Deck ${deckId} generation failed:`, msg);
    await prisma.deck.update({
      where: { id: deckId },
      data: { status: DS.FAILED, generationError: msg.slice(0, 500) },
    }).catch(() => {/* DB write failed too — best effort */});
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server missing GEMINI_API_KEY.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const presetRaw = (formData.get('cardPreset') as string | null)?.toLowerCase();
    const cardPreset: CardCountPreset =
      presetRaw === 'few' || presetRaw === 'many' || presetRaw === 'normal' ? presetRaw : 'normal';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.type !== 'application/pdf')
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    if (file.size > 12 * 1024 * 1024)
      return NextResponse.json({ error: 'File size must be under 12MB' }, { status: 400 });

    // ── Validate auth (fast) ─────────────────────────────────────────────────
    const sessionUserId = readSessionUserId(request);
    if (!sessionUserId)
      return NextResponse.json(
        { error: 'Sign in with Get started on the home page before creating flashcards.' },
        { status: 401 }
      );

    const u = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!u?.onboardingCompletedAt)
      return NextResponse.json(
        { error: 'Complete onboarding first, then open your studio to build decks.' },
        { status: 401 }
      );

    // ── Phase 1: Parse PDF (fast, ~1-3s) ────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown PDF parse error';
      console.error('PDF parse error:', msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const deckTitle =
      file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim() ||
      `Deck ${new Date().toLocaleDateString()}`;

    // ── Create blank deck with GENERATING status (fast, ~100ms) ─────────────
    const deck = await prisma.deck.create({
      data: {
        title: deckTitle,
        userId: u.id,
        status: DS.GENERATING,
      },
    });

    // ── Return response IMMEDIATELY — user is redirected to deck page now ────
    // Phase 2 runs AFTER the response is sent (Next.js 15.1+ after())
    after(async () => {
      await generateAndSaveCards(deck.id, text, cardPreset);
    });

    return NextResponse.json(
      { deck: { id: deck.id, title: deck.title, status: DS.GENERATING }, message: 'Generating flashcards in the background…' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
