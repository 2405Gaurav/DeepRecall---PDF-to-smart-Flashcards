import { NextRequest, NextResponse } from 'next/server';
import { createDeckFromExtractedText } from '@/lib/deck-from-text';
import { extractTextFromPDF } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';
import { readSessionUserId } from '@/lib/session-cookie';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server missing GEMINI_API_KEY.' }, { status: 500 });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Server missing DATABASE_URL.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const presetRaw = (formData.get('cardPreset') as string | null)?.toLowerCase();
    const cardPreset =
      presetRaw === 'few' || presetRaw === 'many' || presetRaw === 'normal' ? presetRaw : 'normal';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 12MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
    } catch (e) {
      console.error('PDF parse error:', e);
      return NextResponse.json(
        { error: 'Could not read this PDF. It may be encrypted or image-only.' },
        { status: 400 }
      );
    }

    const deckTitle =
      file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim() ||
      `Deck ${new Date().toLocaleDateString()}`;

    const sessionUserId = readSessionUserId(request);
    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Sign in with Get started on the home page before creating flashcards.' },
        { status: 401 }
      );
    }
    const u = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!u?.onboardingCompletedAt) {
      return NextResponse.json(
        { error: 'Complete onboarding first, then open your studio to build decks.' },
        { status: 401 }
      );
    }

    const { deck, flashcards } = await createDeckFromExtractedText(deckTitle, text, {
      userId: u.id,
      cardPreset,
    });

    return NextResponse.json(
      {
        deck: { ...deck, flashcards },
        message: `Generated ${flashcards.length} flashcards`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const isClient =
      message.includes('extract enough') ||
      message.includes('Flashcard generation') ||
      message.includes('Too few');
    return NextResponse.json({ error: message }, { status: isClient ? 400 : 500 });
  }
}
