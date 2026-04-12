import type { NextRequest } from 'next/server';
import { readSessionUserId } from '@/lib/session-cookie';

/** Decks without an owner stay open (legacy). Owned decks require the session user to match. */
export function canAccessDeck(
  request: NextRequest,
  deck: { userId: string | null }
): boolean {
  if (deck.userId === null) return true;
  const sid = readSessionUserId(request);
  if (!sid) return false;
  return deck.userId === sid;
}
