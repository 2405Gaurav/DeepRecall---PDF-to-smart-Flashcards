import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getDeckDetailStats } from '@/lib/deck-stats';
import { canAccessDeck } from '@/lib/deck-access';

export const runtime = 'nodejs';

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deck = await prisma.deck.findUnique({
      where: { id },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (!canAccessDeck(request, deck)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const stats = await getDeckDetailStats(id);

    return NextResponse.json({ deck, stats });
  } catch (error) {
    console.error('Get deck error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch deck';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.deck.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    if (!canAccessDeck(request, existing)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success || !parsed.data.title) {
      return NextResponse.json({ error: 'Invalid body: title required' }, { status: 400 });
    }

    const deck = await prisma.deck.update({
      where: { id },
      data: { title: parsed.data.title },
    });

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Patch deck error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update deck';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.deck.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    if (!canAccessDeck(request, existing)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await prisma.deck.delete({ where: { id } });
    return NextResponse.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Delete deck error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete deck';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
